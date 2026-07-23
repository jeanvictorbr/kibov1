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

        // Agora o botão de voltar reconstrói o menu completo com os 3 botões!
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_market').setLabel('Ver Mercado').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('crypto_wallet').setLabel('Acessar Cofre').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('crypto_news').setLabel('📰 Kibo News').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('crypto_tutorial').setLabel('📘 Tutorial').setStyle(ButtonStyle.Secondary)
        );

        // Limpa o texto da mensagem (caso o cara estivesse num terminal de compra) e volta pro Hub
        await interaction.update({ content: '', files: [attachment], components: [row] });
    }
};