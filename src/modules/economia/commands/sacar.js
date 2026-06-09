import { prisma } from '../../../core/database.js';

export default {
    name: 'sacar',
    execute: async (message, args, client, reply) => {
        const amountRaw = args.find(arg => typeof arg === 'number' || arg === 'ALL');
        
        if (!amountRaw) {
            return reply({ description: 'Diga quanto quer tirar do banco. Ex: `k sacar 10m` ou `k sacar tudo`' });
        }

        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (!user || user.bank <= 0) {
            return reply({ description: 'Seu cofre bancário está completamente vazio, chefe.' });
        }

        // Calcula o valor exato se ele digitou "tudo"
        const amount = amountRaw === 'ALL' ? user.bank : amountRaw;

        if (amount > user.bank) {
            return reply({ description: `Você só tem **$${user.bank.toLocaleString()}** guardados no banco.` });
        }

        // Atualiza a carteira e o banco simultaneamente
        await prisma.user.update({
            where: { userId: message.author.id },
            data: {
                bank: { decrement: amount },
                balance: { increment: amount }
            }
        });

        return reply({ 
            title: '💸 Saque Concluído', 
            description: `Você retirou **$${amount.toLocaleString()}** do cofre.\nCuidado ao andar com tanto dinheiro na carteira.` 
        });
    }
};