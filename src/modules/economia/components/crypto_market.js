import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, AttachmentBuilder } from 'discord.js';
import { generateCryptoMarket } from '../../../utils/canvasCrypto.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    customId: 'crypto_market',
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

        const market = await getMarket();
        const buffer = await generateCryptoMarket(market);
        const attachment = new AttachmentBuilder(buffer, { name: 'crypto_market.png' });

        // Menu Dropdown com as 9 Moedas
        const selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('crypto_view_coin')
                .setPlaceholder('Analisar Gráfico de uma Moeda Específica')
                .addOptions([
                    { label: 'KiboDiamond (KBD)', value: 'KBD', description: 'Ativo de Luxo Supremo' },
                    { label: 'QuantumKibo (QTK)', value: 'QTK', description: 'Tecnologia Avançada' },
                    { label: 'KiboGold (KBG)', value: 'KBG', description: 'Reserva de Ouro Seguro' },
                    { label: 'BitKibo (BTK)', value: 'BTK', description: 'Ouro Digital Clássico' },
                    { label: 'EtherKibo (ETHK)', value: 'ETHK', description: 'Investimento Seguro' },
                    { label: 'KiboCoin (KBC)', value: 'KBC', description: 'Moeda Oficial da Engine' },
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