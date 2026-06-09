import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateExtratoCanvas } from '../../../utils/canvasExtrato.js';

export default {
    name: 'extrato',
    execute: async (message, args, client, reply) => {
        const targetId = message.author.id;
        const transacoes = await prisma.transaction.findMany({
            where: { OR: [{ fromUserId: targetId }, { toUserId: targetId }] },
            orderBy: { timestamp: 'desc' },
            take: 8
        });

        const transacoesComInfo = await Promise.all(transacoes.map(async (t) => {
            const isSender = t.fromUserId === targetId;
            const otherId = isSender ? t.toUserId : t.fromUserId;
            let name = "Desconhecido";
            let avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
            try {
                const user = await client.users.fetch(otherId);
                name = user.username;
                avatar = user.displayAvatarURL({ extension: 'png' });
            } catch (e) {}
            
            return { 
                ...t, 
                fromUserName: isSender ? name : message.author.username, 
                toUserName: isSender ? name : message.author.username,
                fromUserAvatar: avatar,
                toUserAvatar: avatar
            };
        }));

        const buffer = await generateExtratoCanvas(message.author, transacoesComInfo, 1);
        const attachment = new AttachmentBuilder(buffer, { name: 'extrato.png' });

        await message.channel.send({ files: [attachment] });
    }
};