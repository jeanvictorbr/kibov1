import { EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    customId: 'crypto_wallet',
    execute: async (interaction) => {
        // Busca a carteira ou cria uma na hora se ele não tiver
        let wallet = await prisma.cryptoWallet.findUnique({ where: { userId: interaction.user.id } });
        if (!wallet) {
            wallet = await prisma.cryptoWallet.create({ data: { userId: interaction.user.id } });
        }

        const market = await getMarket();
        let totalUsd = 0;
        let desc = '';

        for (const data of market) {
            const amount = wallet[data.coin] || 0;
            if (amount > 0) {
                const usdValue = amount * data.price; // Converte a moeda pro valor em dinheiro atual
                totalUsd += usdValue;
                desc += `**${data.coin}**: \`${amount.toLocaleString('pt-BR')}\` moedas (≈ $${usdValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })})\n`;
            }
        }

        if (desc === '') desc = '*Sua carteira de investimentos está vazia!*';

        const embed = new EmbedBuilder()
            .setTitle(`💼 Carteira de Cripto: ${interaction.user.username}`)
            .setColor('#FFD700')
            .setDescription(desc)
            .addFields({ name: '💎 Patrimônio Total (Em Dólar)', value: `$${totalUsd.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}` })
            .setFooter({ text: 'Dica: Use "k vc <moeda> tudo" para vender tudo' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};