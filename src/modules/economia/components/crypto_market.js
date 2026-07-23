import { EmbedBuilder } from 'discord.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    customId: 'crypto_market',
    execute: async (interaction) => {
        const market = await getMarket();
        
        const embed = new EmbedBuilder()
            .setTitle('📊 Cotação Atual - Kibo Exchange')
            .setColor('#00FF66')
            .setFooter({ text: 'Dica: Use "k cc <moeda> <qtd>" para comprar' });

        let desc = '';
        for (const data of market) {
            // Calcula a porcentagem de lucro/prejuízo desde a última hora
            const change = ((data.price - data.lastPrice) / data.lastPrice) * 100;
            let emoji = '➖';
            let sign = '';
            
            if (change > 0) { emoji = '🚀'; sign = '+'; }
            else if (change < 0) { emoji = '🔻'; }

            desc += `**${data.name} (${data.coin})**\n> ${emoji} \`$${data.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\` (${sign}${change.toFixed(2)}%)\n\n`;
        }

        embed.setDescription(desc);
        // O ephemeral faz a mensagem aparecer SÓ pro jogador que clicou, pra não poluir o chat
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};