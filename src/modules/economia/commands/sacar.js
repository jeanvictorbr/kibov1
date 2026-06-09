import { prisma } from '../../../core/database.js';

export default {
    name: 'sacar',
    execute: async (message, args, client, reply) => {
        const amountRaw = args.find(arg => typeof arg === 'number' || arg === 'ALL');
        
        if (!amountRaw) {
            return message.reply('**Diga quanto quer tirar do cofre.**\nEx: `k sacar 10m` ou `k sacar tudo`');
        }

        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (!user || user.bank <= 0) {
            return message.reply('**Seu cofre bancário está completamente vazio, chefe.**');
        }

        const amount = amountRaw === 'ALL' ? user.bank : amountRaw;

        if (amount > user.bank) {
            return message.reply(`**Você só tem $${user.bank.toLocaleString()} guardados no banco.**`);
        }

        await prisma.user.update({
            where: { userId: message.author.id },
            data: {
                bank: { decrement: amount },
                balance: { increment: amount }
            }
        });

        return message.reply(`# 💸 SAQUE CONCLUÍDO!\n**Você retirou $${amount.toLocaleString()} do cofre.**\nCuidado ao andar com tanta grana viva na carteira.`);
    }
};