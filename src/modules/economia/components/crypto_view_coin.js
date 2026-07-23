import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { generateCoinChart } from '../../../utils/canvasCrypto.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    customId: 'crypto_view_coin',
    execute: async (interaction) => {
        // Pega a moeda que o usuário selecionou no menu
        const selectedCoin = interaction.values[0]; 
        const market = await getMarket();
        
        const coinData = market.find(c => c.coin === selectedCoin);

        if (!coinData) {
            return interaction.reply({ content: '❌ Erro ao buscar os dados desta moeda.', ephemeral: true });
        }

        const buffer = await generateCoinChart(coinData);
        const attachment = new AttachmentBuilder(buffer, { name: `grafico_${selectedCoin}.png` });

        // Botão para voltar à lista do Mercado
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_market').setLabel('🔙 Voltar ao Mercado').setStyle(ButtonStyle.Secondary)
        );

        // Atualiza a imagem para o Gráfico
        await interaction.update({ files: [attachment], components: [row] });
    }
};