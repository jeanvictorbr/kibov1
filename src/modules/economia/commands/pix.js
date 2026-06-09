import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { parseAmount } from '../../../utils/parseAmount.js'; // Importe a nossa função mágica

export default {
    name: 'pix',
    execute: async (message, args, client, reply, targetUser) => {
        // 1. Correção: Pegar o valor usando nossa função de parse
        const amount = parseAmount(args[1] || args[0]); 

        if (!targetUser || isNaN(amount) || amount <= 0) {
            return message.reply('**Uso correto:** `k pix @usuario valor` (ex: `k pix @usuario 5k`).');
        }

        if (targetUser.id === message.author.id) {
            return message.reply('**Você não pode enviar dinheiro para si mesmo, chefe.**');
        }

        // 2. Garantir que ambos existem no banco (Blindagem contra erro de destino)
        const sender = await prisma.user.upsert({
            where: { userId: message.author.id },
            update: {},
            create: { userId: message.author.id }
        });

        await prisma.user.upsert({
            where: { userId: targetUser.id },
            update: {},
            create: { userId: targetUser.id }
        });

        // 3. Checagem de saldo
        if (sender.bank < amount) {
            return message.reply(`**Saldo insuficiente no BANCO.**\nVocê só tem **$${sender.bank.toLocaleString()}** guardados.`);
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`pix_confirm_${message.author.id}_${targetUser.id}_${amount}`)
                .setLabel('Confirmar Pix')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`pix_cancel_${message.author.id}`)
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Danger)
        );

        await message.reply({
            content: `# 🏦 TRANSFERÊNCIA PIX\n**Chefe, confirma o envio de $${amount.toLocaleString()} para ${targetUser}?**`,
            components: [row]
        });
    }
};