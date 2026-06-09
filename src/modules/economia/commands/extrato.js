import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateExtratoCanvas } from '../../../utils/canvasExtrato.js';

export default {
    name: 'extrato',
    execute: async (message, args, client, reply) => {
        const targetId = message.author.id;
        const page = 1;

        const transacoes = await prisma.transaction.findMany({
            where: { OR: [{ fromUserId: targetId }, { toUserId: targetId }] },
            orderBy: { timestamp: 'desc' },
            take: 8
        });

        // Prepara os dados pro Canvas
        const transacoesComInfo = await Promise.all(transacoes.map(async (t) => {
            const isSender = t.fromUserId === targetId;
            const otherId = isSender ? t.toUserId : t.fromUserId;
            let user = { username: "Desconhecido", avatar: "https://cdn.discordapp.com/embed/avatars/0.png" };
            try {
                const fetched = await client.users.fetch(otherId);
                user = { username: fetched.username, avatar: fetched.displayAvatarURL({ extension: 'png' }) };
            } catch (e) {}
            
            return { ...t, name: user.username, avatar: user.avatar };
        }));

        const buffer = await generateExtratoCanvas(message.author, transacoesComInfo, page);
        const attachment = new AttachmentBuilder(buffer, { name: 'extrato.png' });

        // Botões com trava de dono no CustomID
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`extrato_nav_${targetId}_${page - 1}`).setLabel('⬅️ Anterior').setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId(`extrato_nav_${targetId}_${page + 1}`).setLabel('Próximo ➡️').setStyle(ButtonStyle.Secondary).setDisabled(page >= 15)
        );

        await message.channel.send({ files: [attachment], components: [row] });
    }
};