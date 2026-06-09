import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateTopCanvas } from '../../../utils/canvasTop.js';

export default {
    name: 'top',
    execute: async (message) => {
        // Busca todos os usuários, somando saldo (carteira + banco) para calcular a fortuna
        const rawUsers = await prisma.user.findMany();
        
        // Calcula a fortuna total e ordena
        const topUsers = rawUsers
            .map(u => ({
                userId: u.userId,
                total: (u.balance || 0) + (u.bank || 0)
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // Busca os avatares e nomes
        const list = await Promise.all(topUsers.map(async (u) => {
            let member = { username: "Desconhecido", avatar: "https://cdn.discordapp.com/embed/avatars/0.png" };
            try {
                const fetched = await message.client.users.fetch(u.userId);
                member = { 
                    username: fetched.username, 
                    avatar: fetched.displayAvatarURL({ extension: 'png', size: 128 }) 
                };
            } catch (e) {}
            return { ...member, balance: u.total };
        }));

        const buffer = await generateTopCanvas(list);
        const attachment = new AttachmentBuilder(buffer, { name: 'top.png' });

        await message.channel.send({ files: [attachment] });
    }
};