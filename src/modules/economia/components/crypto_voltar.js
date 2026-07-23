import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { generateCryptoHub } from '../../../utils/canvasCrypto.js';

export default {
    customId: 'crypto_voltar',
    execute: async (interaction) => {
        // ==========================================
        // 🔒 FECHADURA BIOMÉTRICA
        // ==========================================
        try {
            const originalMsg = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
            if (interaction.user.id !== originalMsg.author.id) {
                return interaction.reply({ content: '🛑 **ACESSO NEGADO!** Esse terminal pertence a outro investidor.', ephemeral: true });
            }
        } catch (err) {
            return interaction.reply({ content: '❌ **Erro de Sessão.**', ephemeral: true });
        }

        const buffer = await generateCryptoHub(interaction.user);
        const attachment = new AttachmentBuilder(buffer, { name: 'crypto_hub.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_market').setLabel('Ver Mercado').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('crypto_wallet').setLabel('Acessar Cofre').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('crypto_news').setLabel('📰 Kibo News').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('crypto_tutorial').setLabel('📘 Tutorial').setStyle(ButtonStyle.Secondary)
        );

        // 🧹 LIMPEZA TOTAL: Remove o content, remove os embeds antigos, remove selects extras e exibe apenas a imagem limpa do Hub com os botões!
        await interaction.update({ 
            content: '', 
            embeds: [], 
            files: [attachment], 
            components: [row] 
        });
    }
};