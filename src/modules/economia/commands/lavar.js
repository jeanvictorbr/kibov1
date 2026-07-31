import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { getFactionOfUser } from '../../../utils/factionService.js';
import { getActiveBuffEffects } from '../../../utils/buffService.js';

// Taxa da lavanderia NPC (sem facção de lavagem)
const NPC_FEE = 0.40;
// Taxa P2P com facção de lavagem (15%, dividida 60/40 entre lavador e caixa da fac)
const P2P_FEE = 0.15;

export default {
    name: 'lavar',
    execute: async (message, args, client, reply, targetUser) => {
        const userId = message.author.id;

        // Garante que o usuário existe
        const user = await prisma.user.upsert({
            where: { userId },
            update: {},
            create: { userId }
        });

        const value = args.find(a => typeof a === 'number');
        if (!value || value <= 0) {
            return message.reply('💸 Manda o valor que você quer lavar! Ex: `k lavar 50000`\nPra lavar com uma facção: `k lavar 50000 @lavador`');
        }

        if (user.dirtyMoney < value) {
            return message.reply(`❌ Você só tem **$${user.dirtyMoney.toLocaleString('pt-BR')}** de grana suja!`);
        }

        // ==========================================
        // 🧼 LAVAGEM P2P: pediu pra alguém de facção Lavagem
        // ==========================================
        if (targetUser) {
            if (targetUser.bot) return message.reply('🤖 O Kibo não lava grana na mão, usa a lavanderia automática!');
            if (targetUser.id === userId) return message.reply('😂 Lavar com você mesmo? Usa `k lavar <valor>` normal!');

            const laundererFaction = await getFactionOfUser(targetUser.id, message.guild.id);
            if (!laundererFaction || laundererFaction.ramo !== 'lavagem') {
                return message.reply('❌ Esse mano não é de uma facção de **Lavagem de Dinheiro**! Marca alguém que seja.');
            }

            const fee = Math.floor(value * P2P_FEE);
            const limpo = value - fee;
            const parteLavador = Math.floor(fee * 0.6);
            const parteFac = fee - parteLavador;

            const embed = new EmbedBuilder()
                .setTitle('🧼 PROPOSTA DE LAVAGEM')
                .setDescription(`O <@${userId}> te chamou na biqueira digital pra lavar **$${value.toLocaleString('pt-BR')}** de grana suja!\n\n💰 Você (lavador) recebe: **$${parteLavador.toLocaleString('pt-BR')}**\n🏴 A facção **${laundererFaction.name}** recebe: **$${parteFac.toLocaleString('pt-BR')}**\n\n🧽 O cliente recebe **$${limpo.toLocaleString('pt-BR')}** limpos na conta. Fecha?`)
                .setColor('#00FFAA');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`lavar_invite_aceitar_${value}_${userId}`).setLabel('✅ Lavar').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`lavar_invite_recusar_${value}_${userId}`).setLabel('❌ Recusar').setStyle(ButtonStyle.Danger)
            );

            return message.channel.send({
                content: `${targetUser}, tem serviço de lavagem pra você!`,
                embeds: [embed],
                components: [row]
            });
        }

        // ==========================================
        // 🏦 LAVAGEM NPC: taxa alta, mas automática
        // ==========================================
        // Se o próprio user for de facção Lavagem, desconta do total
        const myFaction = await getFactionOfUser(userId, message.guild.id);
        const buffEffects = await getActiveBuffEffects(userId);
        let feeRate = myFaction?.ramo === 'lavagem' ? 0.10 : NPC_FEE;
        let buffMsg = '';
        if (feeRate > 0.20 && buffEffects.lavagem) {
            // 💳 Conta de Lavagem: taxa da lavanderia cortada pela metade
            feeRate = 0.20;
            buffMsg = '\n> 💳 Buff **Conta de Lavagem** ativo: taxa reduzida pela metade!';
        }

        const fee = Math.floor(value * feeRate);
        const limpo = value - fee;

        await prisma.user.update({
            where: { userId },
            data: {
                dirtyMoney: { decrement: value },
                balance: { increment: limpo }
            }
        });

        let facMsg = '';
        if (myFaction?.ramo === 'lavagem') {
            // A própria facção leva a taxa de 10% pro caixa
            await prisma.faction.update({
                where: { id: myFaction.id },
                data: { bank: { increment: fee } }
            });
            facMsg = `\n💵 **$${fee.toLocaleString('pt-BR')}** (taxa de 10%) foi pro caixa da sua facção!`;
        }

        return message.reply(`🧼 **DINHEIRO LAVADO!**\nVocê lavou **$${value.toLocaleString('pt-BR')}** de grana suja!\n\n> 💵 **Limpo na conta:** **$${limpo.toLocaleString('pt-BR')}**\n> 🧽 Taxa da lavanderia: **$${fee.toLocaleString('pt-BR')}** (${(feeRate * 100).toFixed(0)}%)${buffMsg}${facMsg}`);
    }
};
