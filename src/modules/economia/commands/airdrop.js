import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { parseAmount } from '../../../utils/parseAmount.js';
import { generateAirdropCanvas } from '../../../utils/canvasAirdrop.js';

export default {
    name: 'airdrop',
    execute: async (message, args) => {
        const userId = message.author.id;

        const amount = parseAmount(args[0]);

        if (isNaN(amount) || amount < 10000) {
            return message.reply('**Chefe, airdrop de miséria não rola!** O valor mínimo para uma Chuva de PIX é **$10.000**.\nExemplo: `k airdrop 500k`');
        }

        const userDb = await prisma.user.findUnique({ where: { userId } });
        
        if (!userDb || userDb.balance < amount) {
            return message.reply(`❌ **Saldo Insuficiente!** Você precisa de **$${amount.toLocaleString('pt-BR')}** na CARTEIRA para ostentar dessa forma.`);
        }

        await prisma.user.update({ where: { userId }, data: { balance: { decrement: amount } } });

        // Gera a Imagem Inicial (ABERTO)
        const bufferOpen = await generateAirdropCanvas(message.author, amount, 'OPEN');
        const attachmentOpen = new AttachmentBuilder(bufferOpen, { name: 'airdrop.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`airdrop_claim`)
                .setLabel('💰 Clicar para Resgatar!')
                .setStyle(ButtonStyle.Success)
        );

        const airdropMessage = await message.channel.send({ 
            content: '@everyone\n# 🌧️ CHUVA DE PIX NO CHAT!', 
            files: [attachmentOpen], 
            components: [row] 
        });

        const filter = (interaction) => interaction.customId === 'airdrop_claim';
        const collector = airdropMessage.createMessageComponentCollector({ filter, time: 60000 });

        const claimers = new Set();

        collector.on('collect', async (interaction) => {
            // Bloco Try-Catch Mágico: Mata o erro 10062 "Unknown interaction" e nunca mais crasha a Engine
            try {
                if (interaction.user.id === userId) {
                    return await interaction.reply({ content: 'Tira a mão! Você não pode apanhar o seu próprio Airdrop.', flags: [MessageFlags.Ephemeral] });
                }

                if (claimers.has(interaction.user.id)) {
                    return await interaction.reply({ content: 'Acalma-te! Já garantiste a tua parte.', flags: [MessageFlags.Ephemeral] });
                }

                claimers.add(interaction.user.id);
                await interaction.reply({ content: '✅ Conseguiste apanhar parte da Chuva de PIX! Aguarda o fim do tempo para receberes o valor no saldo.', flags: [MessageFlags.Ephemeral] });
            } catch (err) {
                // Se a interação falhar por latência do Discord, ele ignora silenciosamente.
            }
        });

        collector.on('end', async () => {
            if (claimers.size === 0) {
                await prisma.user.update({ where: { userId }, data: { balance: { increment: amount } } });
                
                // Gera Imagem Cancelada
                const bufferCanceled = await generateAirdropCanvas(message.author, amount, 'CANCELED');
                const rowCanceled = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('airdrop_closed').setLabel('Cancelado').setStyle(ButtonStyle.Secondary).setDisabled(true)
                );
                
                return airdropMessage.edit({ files: [new AttachmentBuilder(bufferCanceled, { name: 'airdrop.png' })], components: [rowCanceled] }).catch(()=>{});
            }

            const splitAmount = Math.floor(amount / claimers.size);
            const winnerList = Array.from(claimers);

            for (const winnerId of winnerList) {
                await prisma.user.upsert({
                    where: { userId: winnerId },
                    update: { balance: { increment: splitAmount } },
                    create: { userId: winnerId, balance: splitAmount }
                });
            }

            // Gera Imagem Final (FECHADO COM SUCESSO)
            const bufferClosed = await generateAirdropCanvas(message.author, amount, 'CLOSED', claimers.size, splitAmount);
            const rowClosed = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('airdrop_closed').setLabel('Airdrop Fechado').setStyle(ButtonStyle.Secondary).setDisabled(true)
            );

            await airdropMessage.edit({ files: [new AttachmentBuilder(bufferClosed, { name: 'airdrop.png' })], components: [rowClosed] }).catch(()=>{});
            await message.channel.send(`🎉 A Chuva de PIX acabou! **${claimers.size} magnatas** dividiram o lucro e garantiram **$${splitAmount.toLocaleString('pt-BR')}** cada.`);
        });
    }
};