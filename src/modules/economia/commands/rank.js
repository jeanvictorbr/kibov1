import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateTopCanvas } from '../../../utils/canvasTop.js';

export default {
    name: 'rank',
    execute: async (message) => {
        // Busca os 10 mais ricos
        const topData = await prisma.user.findMany({
            orderBy: { balance: 'desc' },
            take: 10
        });

        // Prepara os dados (buscando avatares)
        const usersList = [];
        for (const u of topData) {
            try {
                const member = await message.client.users.fetch(u.userId);
                usersList.push({
                    username: member.username,
                    balance: u.balance,
                    avatarUrl: member.displayAvatarURL({ extension: 'png', size: 128 })
                });
            } catch (e) {
                // Caso não encontre o usuário no cache/Discord
                usersList.push({ username: 'Desconhecido', balance: u.balance, avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png' });
            }
        }

        const buffer = await generateTopCanvas(usersList);
        const attachment = new AttachmentBuilder(buffer, { name: 'top_ranking.png' });

        await message.channel.send({ files: [attachment] });
    }
};