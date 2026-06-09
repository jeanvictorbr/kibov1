import { prisma } from '../../../core/database.js';

export default {
    name: 'trabalhar',
    execute: async (message, args, client, reply) => {
        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        
        // Base: $1000 a $5000. Se for VIP: 2.5x o valor.
        let ganho = Math.floor(Math.random() * 4000) + 1000;
        let bonus = "";

        if (user?.isPremium) {
            ganho = Math.floor(ganho * 2.5);
            bonus = "\n*💎 Bónus VIP aplicado!*";
        }

        await prisma.user.update({
            where: { userId: message.author.id },
            data: { balance: { increment: ganho } }
        });

        return message.reply(`# 🏗️ TRABALHO CONCLUÍDO!\n**Você suou a camisa e recebeu $${ganho.toLocaleString()} na carteira.**${bonus}`);
    }
};