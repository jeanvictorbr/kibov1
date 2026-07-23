import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { getMarket } from '../../../utils/cryptoMarket.js';
import { generateCryptoReceipt } from '../../../utils/canvasCrypto.js';

export default {
    customId: 'crypto_buy_1',
    execute: async (interaction) => {
        try {
            const originalMsg = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
            if (interaction.user.id !== originalMsg.author.id) return interaction.reply({ content: '🛑 Acesso Negado.', ephemeral: true });
        } catch (err) {}

        // 🧠 HACK: Lê a moeda selecionada através do texto da mensagem original
        const coinMatch = interaction.message.content.match(/Ativo Selecionado:\*\* \`([A-Z]+)\`/);
        if (!coinMatch) return interaction.reply({ content: '❌ Erro de leitura do ativo.', ephemeral: true });
        
        const coinStr = coinMatch[1];
        const qtd = 1; // Quantidade da compra

        const market = await getMarket();
        const coinData = market.find(c => c.coin === coinStr);
        const cost = coinData.price * qtd;

        const user = await prisma.user.findUnique({ where: { userId: interaction.user.id } });
        if (!user || user.balance < cost) {
            return interaction.reply({ content: `❌ **Saldo Insuficiente!** Você precisa de **$${cost.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}** na carteira.`, ephemeral: true });
        }

        // Faz a transação no Prisma
        await prisma.user.update({ where: { userId: interaction.user.id }, data: { balance: { decrement: cost } } });
        await prisma.cryptoWallet.upsert({
            where: { userId: interaction.user.id },
            update: { [coinStr]: { increment: qtd } },
            create: { userId: interaction.user.id, [coinStr]: qtd }
        });

        // Gera o Comprovante Visual
        const buffer = await generateCryptoReceipt(interaction.user, 'COMPRA', coinStr, qtd, cost, coinData.price);
        const attachment = new AttachmentBuilder(buffer, { name: 'recibo_compra.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_market').setLabel('🔙 Voltar ao Mercado').setStyle(ButtonStyle.Primary)
        );

        // Substitui a tela pelo comprovante
        await interaction.update({ content: '✅ **ORDEM EXECUTADA COM SUCESSO!**', files: [attachment], components: [row] });
    }
};