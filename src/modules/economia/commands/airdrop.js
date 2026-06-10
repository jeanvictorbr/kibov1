import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { parseAmount } from '../../../utils/parseAmount.js';
import { generateAirdropCanvas } from '../../../utils/canvasAirdrop.js';

// Cria a memória volátil se não existir
if (!global.activeAirdrops) global.activeAirdrops = new Map();

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
            return message.reply(`❌ **Saldo Insuficiente!** Você precisa de **$${amount.toLocaleString('pt-BR')}** na CARTEIRA.`);
        }

        // Tira o dinheiro do bolso dele
        await prisma.user.update({ where: { userId }, data: { balance: { decrement: amount } } });

        // Gera um ID único para este evento
        const airdropId = Date.now().toString();

        // Salva as informações no Cérebro do bot
        global.activeAirdrops.set(airdropId, {
            hostId: userId,
            amount: amount,
            claimers: new Set()
        });

        const bufferOpen = await generateAirdropCanvas(message.author, amount, 'OPEN');
        
        // O Botão agora chama o ficheiro externo "airdrop_action"
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`airdrop_action_claim_${airdropId}`)
                .setLabel('💰 PEGUE AQUI!')
                .setStyle(ButtonStyle.Success)
        );

        const airdropMsg = await message.channel.send({ 
            content: '@everyone\n# 🌧️ CHUVA DE PIX INICIADA!', 
            files: [new AttachmentBuilder(bufferOpen, { name: 'airdrop.png' })], 
            components: [row] 
        });

        // O temporizador finaliza sozinho após 60 segundos
        setTimeout(async () => {
            const airdropData = global.activeAirdrops.get(airdropId);
            if (!airdropData) return;
            
            global.activeAirdrops.delete(airdropId); // Limpa da RAM

            const participants = airdropData.claimers.size;

            if (participants === 0) {
                await prisma.user.update({ where: { userId }, data: { balance: { increment: amount } } });
                const bufferCanceled = await generateAirdropCanvas(message.author, amount, 'CANCELED');
                const rowCanceled = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('airdrop_off').setLabel('Encerrado').setStyle(ButtonStyle.Secondary).setDisabled(true)
                );
                return airdropMsg.edit({ files: [new AttachmentBuilder(bufferCanceled, { name: 'airdrop.png' })], components: [rowCanceled] }).catch(()=>{});
            }

            // Matemática do dinheiro
            const splitAmount = Math.floor(amount / participants);
            const winnerList = Array.from(airdropData.claimers);

            // Entrega os valores
            for (const winnerId of winnerList) {
                await prisma.user.upsert({
                    where: { userId: winnerId },
                    update: { balance: { increment: splitAmount } },
                    create: { userId: winnerId, balance: splitAmount }
                });
            }

            // Atualiza para a arte de Fechado
            const bufferClosed = await generateAirdropCanvas(message.author, amount, 'CLOSED', participants, splitAmount);
            const rowClosed = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('airdrop_off').setLabel('Dinheiro Entregue').setStyle(ButtonStyle.Secondary).setDisabled(true)
            );

            await airdropMsg.edit({ files: [new AttachmentBuilder(bufferClosed, { name: 'airdrop.png' })], components: [rowClosed] }).catch(()=>{});
            await message.channel.send(`🎉 **AIRDROP FINALIZADO!**\n**${participants} jogadores** foram rápidos no gatilho e acabam de receber **$${splitAmount.toLocaleString('pt-BR')}** cada nas suas contas.`);
        }, 60000);
    }
};