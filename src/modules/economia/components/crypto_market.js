import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { generateCryptoMarket } from '../../../utils/canvasCrypto.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    customId: 'crypto_market',
    execute: async (interaction) => {
        const market = await getMarket();
        const buffer = await generateCryptoMarket(market);
        const attachment = new AttachmentBuilder(buffer, { name: 'crypto_market.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_voltar').setLabel('🔙 Voltar ao Hub').setStyle(ButtonStyle.Danger)
        );

        // Atualiza a mesma mensagem com a nova imagem e o botão de voltar
        await interaction.update({ files: [attachment], components: [row] });
    }
};