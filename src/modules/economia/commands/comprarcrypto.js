import { prisma } from '../../../core/database.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    name: 'comprarcrypto',
    aliases: ['cc', 'comprarcripto', 'compra_crypto'], // Atalhos que também ativam o comando
    execute: async (message, args) => {
        if (!args[0] || !args[1]) return message.reply('❌ **Uso correto:** `k comprarcrypto <Moeda> <Quantidade>` (Ex: `k comprarcrypto BTK 15` ou `k cc BTK 15`)');

        const coinStr = args[0].toUpperCase();
        let qtd = parseFloat(args[1]);

        if (isNaN(qtd) || qtd <= 0) return message.reply('❌ Quantidade inválida.');

        const market = await getMarket();
        const coinData = market.find(c => c.coin === coinStr);
        if (!coinData) return message.reply(`❌ A moeda **${coinStr}** não existe na Exchange.`);

        const cost = coinData.price * qtd;

        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (!user || user.balance < cost) {
            return message.reply(`❌ Saldo insuficiente na Carteira. Custa **$${cost.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}**.`);
        }

        // Tira o dinheiro e bota a moeda
        await prisma.user.update({ where: { userId: message.author.id }, data: { balance: { decrement: cost } } });
        await prisma.cryptoWallet.upsert({
            where: { userId: message.author.id },
            update: { [coinStr]: { increment: qtd } },
            create: { userId: message.author.id, [coinStr]: qtd }
        });

        message.reply(`🟢 **COMPRA EFETUADA!** Você adquiriu **${qtd} ${coinStr}** por **$${cost.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}**.`);
    }
};