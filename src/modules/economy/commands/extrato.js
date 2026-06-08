import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    name: 'extrato',
    execute: async (message, args, client, reply) => {
        // Se for Dev, pode ver o ID de quem ele quiser, senão é o autor
        let targetId = message.author.id;
        if (args[0] && message.author.id === process.env.DEVELOPER_ID) {
            const mention = message.mentions.users.first()?.id;
            if (mention) targetId = mention;
        }

        const page = 1;
        const take = 10;
        const skip = (page - 1) * take;

        const transacoes = await prisma.transaction.findMany({
            where: { OR: [{ fromUserId: targetId }, { toUserId: targetId }] },
            orderBy: { timestamp: 'desc' },
            take,
            skip
        });

        let desc = transacoes.map(t => 
            `**${t.fromUserId === targetId ? '📤 Enviou' : '📥 Recebeu'}** $${t.amount.toLocaleString()} - ${new Date(t.timestamp).toLocaleDateString()}`
        ).join('\n') || "Nenhuma movimentação encontrada, chefe.";

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`extrato_nav_${targetId}_${page - 1}`).setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(page === 1),
            new ButtonBuilder().setCustomId(`extrato_nav_${targetId}_${page + 1}`).setLabel('➡️').setStyle(ButtonStyle.Secondary)
        );

        reply({ title: `Extrato Financeiro`, description: desc }, [row]);
    }
};