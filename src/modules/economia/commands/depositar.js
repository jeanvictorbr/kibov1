import { prisma } from '../../../core/database.js';

export default {
    name: 'depositar',
    execute: async (message, args, client, reply) => {
        const amountRaw = args.find(arg => typeof arg === 'number' || arg === 'ALL');
        
        if (!amountRaw) {
            return reply({ description: 'Chefe, me diga quanto quer guardar. Ex: `k depositar 10m` ou `k depositar tudo`' });
        }

        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (!user || user.balance <= 0) {
            return reply({ description: 'Sua carteira está vazia, chefe. Não há nada para depositar.' });
        }

        // Calcula o valor exato se ele digitou "tudo"
        const amount = amountRaw === 'ALL' ? user.balance : amountRaw;

        if (amount > user.balance) {
            return reply({ description: `Você só tem **$${user.balance.toLocaleString()}** na carteira.` });
        }

        // Atualiza a carteira e o banco simultaneamente
        await prisma.user.update({
            where: { userId: message.author.id },
            data: {
                balance: { decrement: amount },
                bank: { increment: amount }
            }
        });

        return reply({ 
            title: '🏦 Depósito Concluído', 
            description: `Você guardou **$${amount.toLocaleString()}** no cofre.\nEste dinheiro agora está seguro contra roubos.` 
        });
    }
};