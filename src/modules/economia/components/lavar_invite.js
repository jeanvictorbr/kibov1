import { MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { getFactionOfUser } from '../../../utils/factionService.js';

const P2P_FEE = 0.15;

export default {
    customId: 'lavar_invite',
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        // ['lavar', 'invite', 'aceitar'|'recusar', value, clientId]
        const action = parts[2];
        const value = parseInt(parts[3], 10);
        const clientId = parts[4];
        const laundererId = interaction.user.id;

        // Só quem é de facção de Lavagem pode executar a lavagem
        const laundererFaction = await getFactionOfUser(laundererId, interaction.guild.id);
        if (!laundererFaction || laundererFaction.ramo !== 'lavagem') {
            return interaction.reply({ content: '❌ Você não é de uma facção de Lavagem!', flags: [MessageFlags.Ephemeral] });
        }

        if (action === 'recusar') {
            return interaction.update({ content: '🚫 O lavador recusou o serviço. Queima não, que a gente lava na lavanderia comum.', embeds: [], components: [] });
        }

        // Revalidação: cliente ainda tem a grana suja?
        const client = await prisma.user.findUnique({ where: { userId: clientId } });
        if (!client || client.dirtyMoney < value) {
            return interaction.update({ content: '🤡 O cliente não tem mais a grana suja pra lavar! Serviço cancelado.', embeds: [], components: [] });
        }

        const fee = Math.floor(value * P2P_FEE);
        const limpo = value - fee;
        const parteLavador = Math.floor(fee * 0.6);
        const parteFac = fee - parteLavador;

        await prisma.$transaction([
            prisma.user.update({ where: { userId: clientId }, data: { dirtyMoney: { decrement: value }, balance: { increment: limpo } } }),
            prisma.user.update({ where: { userId: laundererId }, data: { balance: { increment: parteLavador } } }),
            prisma.faction.update({ where: { id: laundererFaction.id }, data: { bank: { increment: parteFac }, xp: { increment: 5 } } })
        ]);

        return interaction.update({
            content: `✅ **LAVAGEM CONCLUÍDA!**\n\n<@${clientId}>: **$${value.toLocaleString('pt-BR')}** de grana suja lavados — **$${limpo.toLocaleString('pt-BR')}** caiu limpo na sua conta!\n\n🧼 <@${laundererId}> recebeu **$${parteLavador.toLocaleString('pt-BR')}** e a facção **${laundererFaction.name}** levou **$${parteFac.toLocaleString('pt-BR')}** pro caixa.`,
            embeds: [],
            components: []
        });
    }
};
