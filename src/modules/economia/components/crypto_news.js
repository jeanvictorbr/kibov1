import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { generateCryptoNews } from '../../../utils/canvasCrypto.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    customId: 'crypto_news',
    execute: async (interaction) => {
        try {
            const originalMsg = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
            if (interaction.user.id !== originalMsg.author.id) return interaction.reply({ content: '🛑 Acesso Negado.', ephemeral: true });
        } catch (err) {}

        const market = await getMarket();
        const buffer = await generateCryptoNews(market);
        const attachment = new AttachmentBuilder(buffer, { name: 'crypto_news.png' });
        
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('crypto_voltar').setLabel('🔙 Voltar ao Hub').setStyle(ButtonStyle.Danger));
        await interaction.update({ files: [attachment], components: [row] });
    }
};