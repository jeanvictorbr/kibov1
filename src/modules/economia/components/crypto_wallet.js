import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateCryptoWallet } from '../../../utils/canvasCrypto.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    customId: 'crypto_wallet',
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