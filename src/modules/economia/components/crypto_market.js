import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, AttachmentBuilder } from 'discord.js';
import { generateCryptoMarket } from '../../../utils/canvasCrypto.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    customId: 'crypto_market',
    execute: async (interaction) => {
        const market = await getMarket();
        const buffer = await generateCryptoMarket(market);
        const attachment = new AttachmentBuilder(buffer, { name: 'crypto_market.png' });

        // Cria o Menu Dropdown para Análise Detalhada
        const selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('crypto_view_coin')
                .setPlaceholder('Analisar Gráfico de uma Moeda Específica')
                .addOptions([
                    { label: 'BitKibo (BTK)', value: 'BTK', description: 'Ouro Digital' },
                    { label: 'EtherKibo (ETHK)', value: 'ETHK', description: 'Investimento Seguro' },
                    { label: 'KiboCoin (KBC)', value: 'KBC', description: 'Moeda Oficial' },
                    { label: 'SolanaKibo (SOLK)', value: 'SOLK', description: 'Volatilidade Alta' },
                    { label: 'DogeKibo (DGK)', value: 'DGK', description: 'Meme Coin' },
                    { label: 'ShibaKibo (SHBK)', value: 'SHBK', description: 'Meme Loteria' },
                ])
        );

        const buttonsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_voltar').setLabel('🔙 Voltar ao Hub').setStyle(ButtonStyle.Danger)
        );

        await interaction.update({ files: [attachment], components: [selectMenu, buttonsRow] });
    }
};