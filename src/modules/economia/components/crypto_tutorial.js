import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { generateCryptoTutorial } from '../../../utils/canvasCrypto.js';

export default {
    customId: 'crypto_tutorial',
    execute: async (interaction) => {
        // 🔒 FECHADURA BIOMÉTRICA
        try {
            const originalMsg = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
            if (interaction.user.id !== originalMsg.author.id) {
                return interaction.reply({ content: '🛑 **ACESSO NEGADO!** Esse terminal pertence a outro investidor.', ephemeral: true });
            }
        } catch (err) {
            return interaction.reply({ content: '❌ **Erro de Sessão.**', ephemeral: true });
        }

        const buffer = await generateCryptoTutorial();
        const attachment = new AttachmentBuilder(buffer, { name: 'crypto_tutorial.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_voltar').setLabel('🔙 Voltar ao Hub').setStyle(ButtonStyle.Danger)
        );

        await interaction.update({ files: [attachment], components: [row] });
    }
};