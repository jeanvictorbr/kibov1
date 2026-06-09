import { prisma } from '../../../core/database.js';

export default {
    name: 'depositar',
    execute: async (message, args, client, reply) => {
        const amountRaw = args.find(arg => typeof arg === 'number' || arg === 'ALL');
        
        if (!amountRaw) {
            return message.reply('**Chefe, me diga quanto quer guardar.**\nEx: `k depositar 10m` ou `k depositar tudo`');
        }

        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (!user || user.balance <= 0) {
            return message.reply('**Sua carteira está vazia, chefe.**\nNão há nada de valor para depositar.');
        }

        const amount = amountRaw === 'ALL' ? user.balance : amountRaw;

        if (amount > user.balance) {
            return message.reply(`**Você só tem $${user.balance.toLocaleString()} na carteira.**`);
        }

        await prisma.user.update({
            where: { userId: message.author.id },
            data: {
                balance: { decrement: amount },
                bank: { increment: amount }
            }
        });

        return message.reply(`# 🏦 DEPÓSITO CONCLUÍDO!\n**Você guardou $${amount.toLocaleString()} no cofre.**\nEste dinheiro agora está blindado contra roubos na rua.`);
    }
};