import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { generateCryptoHub } from '../../../utils/canvasCrypto.js';

export default {
    customId: 'crypto_voltar',
    execute: async (interaction) => {
        // ==========================================
        // 🔒 FECHADURA BIOMÉTRICA (ANTI-INTROMETIDOS)
        // ==========================================
        try {
            // Busca a mensagem original que o bot respondeu
            const originalMsg = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
            
            // Se o ID de quem clicou for diferente de quem deu o comando k crypto...
            if (interaction.user.id !== originalMsg.author.id) {
                return interaction.reply({ 
                    content: '🛑 **ACESSO NEGADO!** Você não tem permissão para operar no terminal de outro jogador. Digite `k crypto` para abrir a sua própria Exchange.', 
                    ephemeral: true // Só o intrometido vê esse esporro
                });
            }
        } catch (err) {
            // Se a mensagem original foi deletada, trava tudo por segurança
            return interaction.reply({ 
                content: '❌ **Erro de Sessão:** A mensagem original não foi encontrada. Digite o comando novamente.', 
                ephemeral: true 
            });
        }
        // ==========================================
        const buffer = await generateCryptoHub(interaction.user);
        const attachment = new AttachmentBuilder(buffer, { name: 'crypto_hub.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_market').setLabel('Ver Cotação Geral').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('crypto_wallet').setLabel('Acessar Cofre').setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({ files: [attachment], components: [row] });
    }
};