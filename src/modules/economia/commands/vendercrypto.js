import { prisma } from '../../../core/database.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    name: 'vendercrypto',
    aliases: ['vc', 'vendercripto', 'venda_crypto'], // Atalhos
    execute: async (message, args) => {
        if (!args[0] || !args[1]) return message.reply('❌ **Uso correto:** `k vendercrypto <Moeda> <Quantidade>` (Ex: `k vendercrypto BTK 15` ou `k vc BTK tudo`)');

        const coinStr = args[0].toUpperCase();
        const market = await getMarket();
        const coinData = market.find(c => c.coin === coinStr);
        
        if (!coinData) return message.reply(`❌ Moeda **${coinStr}** não encontrada.`);

        const wallet = await prisma.cryptoWallet.findUnique({ where: { userId: message.author.id } });
        if (!wallet || wallet[coinStr] <= 0) return message.reply(`❌ Você não tem **${coinStr}** guardado na carteira!`);

        let qtd = 0;
        
        // Sistema inteligente: permite vender tudo de uma vez
        if (args[1].toLowerCase() === 'tudo' || args[1].toLowerCase() === 'all') {
            qtd = wallet[coinStr];
        } else {
            qtd = parseFloat(args[1]);
        }

        if (isNaN(qtd) || qtd <= 0 || qtd > wallet[coinStr]) {
            return message.reply(`❌ Quantidade inválida. Você possui **${wallet[coinStr]} ${coinStr}**.`);
        }

        const profit = coinData.price * qtd;

        // Tira a moeda e paga em dinheiro
        await prisma.cryptoWallet.update({ where: { userId: message.author.id }, data: { [coinStr]: { decrement: qtd } } });
        await prisma.user.update({ where: { userId: message.author.id }, data: { balance: { increment: profit } } });

        message.reply(`🔴 **LUCRO REALIZADO!** Você vendeu **${qtd} ${coinStr}** e embolsou **$${profit.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}**!`);
    }
};