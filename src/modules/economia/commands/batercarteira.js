import { prisma } from '../../../core/database.js';

export default {
    name: 'batercarteira',
    execute: async (message, args, client, reply) => {
        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        const chance = Math.random();

        if (chance > 0.6) {
            // SUCESSO
            let ganho = Math.floor(Math.random() * 2000) + 500;
            if (user?.isPremium) ganho = Math.floor(ganho * 2);

            await prisma.user.update({ where: { userId: message.author.id }, data: { balance: { increment: ganho } } });
            return message.reply(`# 🥷 BATEU A CARTEIRA!\n**Você agiu rápido e tirou $${ganho.toLocaleString()} de um otário na rua.**`);
        } else {
            // FRACASSO
            const perda = Math.floor(Math.random() * 500) + 100;
            await prisma.user.update({ where: { userId: message.author.id }, data: { balance: { decrement: perda } } });
            return message.reply(`# 👮 A POLÍCIA TE VIU!\n**Você tentou bater a carteira, mas rodou e teve que pagar $${perda.toLocaleString()} de propina.**`);
        }
    }
};