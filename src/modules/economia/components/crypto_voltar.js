import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { generateCryptoHub } from '../../../utils/canvasCrypto.js';

export default {
    customId: 'crypto_voltar',
    execute: async (interaction) => {
        const buffer = await generateCryptoHub(interaction.user);
        const attachment = new AttachmentBuilder(buffer, { name: 'crypto_hub.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_market').setLabel('📊 Ver Mercado').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('crypto_wallet').setLabel('💼 Minha Carteira').setStyle(ButtonStyle.Success)
        );

        await interaction.update({ files: [attachment], components: [row] });
    }
};