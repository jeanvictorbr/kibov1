import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { getMarket } from '../../../utils/cryptoMarket.js';
import { generateCryptoReceipt } from '../../../utils/canvasCrypto.js';

export default {
    customId: 'crypto_buy_10',
    execute: async (interaction) => {
        try {
            const originalMsg = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
            if (interaction.user.id !== originalMsg.author.id) return interaction.reply({ content: '🛑 Acesso Negado.', ephemeral: true });
        } catch (err) {}

        const coinMatch = interaction.message.content.match(/Ativo Selecionado:\*\* \`([A-Z]+)\`/);
        if (!coinMatch) return interaction.reply({ content: '❌ Erro de leitura do ativo.', ephemeral: true });
        
        const coinStr = coinMatch[1];
        const qtd = 10; // Quantidade exata: 10

        const market = await getMarket();
        const coinData = market.find(c => c.coin === coinStr);
        
        // Matemática das Taxas
        const grossCost = coinData.price * qtd;
        const fee = grossCost * 0.02; // TAXA DE CORRETORA (2%)
        const totalCost = grossCost + fee;

        const user = await prisma.user.findUnique({ where: { userId: interaction.user.id } });
        if (!user || user.balance < totalCost) {
            return interaction.reply({ content: `❌ **Saldo Insuficiente!** Com as taxas da rede (2%), a ordem custa **$${totalCost.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}**.`, ephemeral: true });
        }

        // Tira o dinheiro da conta e SALVA o valor investido
        await prisma.user.update({ where: { userId: interaction.user.id }, data: { balance: { decrement: totalCost } } });
        await prisma.cryptoWallet.upsert({
            where: { userId: interaction.user.id },
            update: { 
                [coinStr]: { increment: qtd },
                [`${coinStr}_inv`]: { increment: totalCost } // Salva o custo pro Preço Médio
            },
            create: { userId: interaction.user.id, [coinStr]: qtd, [`${coinStr}_inv`]: totalCost }
        });

        const buffer = await generateCryptoReceipt(interaction.user, 'COMPRA', coinStr, qtd, grossCost, fee, totalCost, coinData.price);
        const attachment = new AttachmentBuilder(buffer, { name: 'recibo_compra.png' });
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crypto_market').setLabel('🔙 Voltar ao Mercado').setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ content: '✅ **ORDEM EXECUTADA COM SUCESSO!**', files: [attachment], components: [row] });
    }
};