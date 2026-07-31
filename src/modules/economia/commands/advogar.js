import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';

const VALOR_PADRAO = 10000;

export default {
    name: 'advogar',
    execute: async (message, args, client, reply, targetUser) => {
        const userId = message.author.id;

        const userDb = await prisma.user.findUnique({ where: { userId } });
        if (userDb?.currentJob !== 'advogado') {
            return message.reply('⚖️ Só quem é **Advogado** com OAB na carteira pode tirar preso na lábia! Usa `k trabalhar`.');
        }

        if (!targetUser) {
            return message.reply('⚖️ Marca o preso que quer defender! Ex: `k advogar @preso 15000`');
        }
        if (targetUser.id === userId) {
            return message.reply('🤨 Advogar pra si mesmo? Você tá na rua, chefe. O que tá fazendo preso?');
        }
        if (targetUser.bot) {
            return message.reply('🤖 O Kibo não pega cadeia, pega só processamento.');
        }

        const preso = await prisma.cooldown.findUnique({
            where: { userId_command: { userId: targetUser.id, command: 'preso' } }
        });
        if (!preso || preso.expiresAt < new Date()) {
            return message.reply(`🕊️ O <@${targetUser.id}> tá solto na rua! Não tem pena pra você reduzir.`);
        }

        const valor = args.find(a => typeof a === 'number') || VALOR_PADRAO;
        if (valor <= 0) {
            return message.reply('💸 Valor inválido! Manda o cachê: `k advogar @preso 15000`');
        }

        const cliente = await prisma.user.findUnique({ where: { userId: targetUser.id } });
        if (!cliente || cliente.balance < valor) {
            return message.reply(`❌ O <@${targetUser.id}> não tem **$${valor.toLocaleString('pt-BR')}** na carteira pra pagar o advogado!`);
        }

        const totalMin = Math.ceil((preso.expiresAt - new Date()) / 60000);
        const reducaoBase = Math.max(5, Math.floor(totalMin * 0.3));

        const embed = new EmbedBuilder()
            .setTitle('⚖️ PROPOSTA DE DEFESA')
            .setDescription(`Aí <@${targetUser.id}>, você tá com a grade te segurando e o <@${userId}> apareceu com um habeas corpus na mão!\n\n⏳ **Sua pena atual:** ${totalMin} minutos\n📉 **Redução garantida:** pelo menos **${reducaoBase} minutos** (mais se a Lábia for afiada!)\n💸 **Cachê do advogado:** **$${valor.toLocaleString('pt-BR')}**\n\nAceita a defesa?`)
            .setColor('#9C27B0');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`servico_invite_advogar_${valor}_${targetUser.id}_${userId}_aceitar`).setLabel('✅ Me tira daqui').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`servico_invite_advogar_${valor}_${targetUser.id}_${userId}_recusar`).setLabel('❌ Fico de boa').setStyle(ButtonStyle.Danger)
        );

        return message.channel.send({
            content: `<@${targetUser.id}>, seu advogado de plantão tá na porta da cadeia!`,
            embeds: [embed],
            components: [row]
        });
    }
};
