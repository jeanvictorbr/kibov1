import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { getMarket } from '../../../utils/cryptoMarket.js';
import { generateCryptoReceipt } from '../../../utils/canvasCrypto.js';

export default {
    customId: 'crypto_sell_all',
    execute: async (interaction) => {
        try {
            const originalMsg = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
            if (interaction.user.id !== originalMsg.author.id) return interaction.reply({ content: '🛑 Acesso Negado.', ephemeral: true });
        } catch (err) {}

        const coinMatch = interaction.message.content.match(/Ativo Selecionado:\*\* \`([A-Z]+)\`/);
        if (!coinMatch) return interaction.reply({ content: '❌ Erro de leitura do ativo.', ephemeral: true });
        
        const coinStr = coinMatch[1];

        const wallet = await prisma.cryptoWallet.findUnique({ where: { userId: interaction.user.id } });
        if (!wallet || wallet[coinStr] <= 0) return interaction.reply({ content: `❌ Você não tem nenhuma unidade de ${coinStr} para vender.`, ephemeral: true });

        const qtd = wallet[coinStr]; // Pega tudo que ele tem
        const market = await getMarket();
        const coinData = market.find(c => c.coin === coinStr);
        const profit = coinData.price * qtd;

        // Tira as moedas e entrega o PIX na conta do cara
        await prisma.cryptoWallet.update({ where: { userId: interaction.user.id }, data: { [coinStr]: { decrement: qtd } } });
        await prisma.user.update({ where: { userId: interaction.user.id }, data: { balance: { increment: profit } } });

        // Gera o Comprovante Visual (PIX)
        const buffer = await generateCryptoReceipt(interaction.user, 'VENDA', coinStr, qtd, profit, coinData.price);
        const attachment = new AttachmentBuilder(buffer, { name: 'recibo_venda.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_market').setLabel('🔙 Voltar ao Mercado').setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ content: '💰 **LUCRO DEPOSITADO VIA PIX (KiboCash)!**', files: [attachment], components: [row] });
    }
};