import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateCryptoWallet } from '../../../utils/canvasCrypto.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    customId: 'crypto_wallet',
    execute: async (interaction) => {
        let wallet = await prisma.cryptoWallet.findUnique({ where: { userId: interaction.user.id } });
        if (!wallet) {
            wallet = await prisma.cryptoWallet.create({ data: { userId: interaction.user.id } });
        }

        const market = await getMarket();
        const buffer = await generateCryptoWallet(interaction.user, wallet, market);
        const attachment = new AttachmentBuilder(buffer, { name: 'crypto_wallet.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_voltar').setLabel('🔙 Voltar ao Hub').setStyle(ButtonStyle.Danger)
        );

        await interaction.update({ files: [attachment], components: [row] });
    }
};