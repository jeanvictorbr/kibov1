import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateExtratoCanvas } from '../../../utils/canvasExtrato.js';

export default {
    name: 'extrato',
    execute: async (message, args, client, reply) => {
        const targetId = message.author.id;
        const page = 1;
        const take = 8;

        const transacoes = await prisma.transaction.findMany({
            where: { OR: [{ fromUserId: targetId }, { toUserId: targetId }] },
            orderBy: { timestamp: 'desc' },
            take,
            skip: 0
        });

        // Tentar resolver nomes para o Canvas
        const transacoesComNomes = await Promise.all(transacoes.map(async (t) => {
            const otherId = t.fromUserId === targetId ? t.toUserId : t.fromUserId;
            let name = "Desconhecido";
            try {
                const user = await client.users.fetch(otherId);
                name = user.username;
            } catch (e) {}
            return { ...t, fromUserId: name, toUserId: name }; // Reutilizando campos para passar o nome
        }));

        const buffer = await generateExtratoCanvas(message.author, transacoesComNomes, page);
        const attachment = new AttachmentBuilder(buffer, { name: 'extrato.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`extrato_nav_${targetId}_${page - 1}`).setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId(`extrato_nav_${targetId}_${page + 1}`).setLabel('➡️').setStyle(ButtonStyle.Secondary)
        );

        await message.channel.send({ files: [attachment], components: [row] });
    }
};