import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateCoinChart } from '../../../utils/canvasCrypto.js';
import { getMarket } from '../../../utils/cryptoMarket.js';

export default {
    customId: 'crypto_view_coin',
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

        const selectedCoin = interaction.values[0]; 
        const market = await getMarket();
        const coinData = market.find(c => c.coin === selectedCoin);

        if (!coinData) return interaction.reply({ content: '❌ Erro ao buscar os dados do mercado.', ephemeral: true });

        // Verifica o saldo da moeda e o INVESTIMENTO TOTAL (Preço Médio)
        let wallet = await prisma.cryptoWallet.findUnique({ where: { userId: interaction.user.id } });
        const userAmount = wallet ? (wallet[selectedCoin] || 0) : 0;
        const userInvested = wallet ? (wallet[`${selectedCoin}_inv`] || 0) : 0; 

        // Gera o gráfico passando o saldo e o investimento para calcular o Lucro!
        const buffer = await generateCoinChart(coinData, userAmount, userInvested);
        const attachment = new AttachmentBuilder(buffer, { name: `grafico_${selectedCoin}.png` });

        // ==========================================
        // BOTÕES DE AÇÃO RÁPIDA (DAY TRADE)
        // ==========================================
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_buy_1').setLabel('🟢 Comprar 1x').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('crypto_buy_10').setLabel('🟢 Comprar 10x').setStyle(ButtonStyle.Success)
        );

        // Só mostra o botão de Vender se ele tiver pelo menos 1 moeda!
        if (userAmount > 0) {
            row1.addComponents(
                new ButtonBuilder().setCustomId('crypto_sell_all').setLabel('🔴 Vender Tudo').setStyle(ButtonStyle.Danger)
            );
        }

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_market').setLabel('🔙 Voltar ao Mercado').setStyle(ButtonStyle.Secondary)
        );

        // Atualiza a tela mantendo o "Ativo Selecionado" oculto no texto para os botões lerem
        await interaction.update({ 
            content: `📈 **Terminal de Operações | Ativo Selecionado:** \`${selectedCoin}\``, 
            files: [attachment], 
            components: [row1, row2] 
        });
    }
};