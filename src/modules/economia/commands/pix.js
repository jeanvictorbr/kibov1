import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    name: 'pix',
    execute: async (message, args, client, reply, targetUser) => {
        const amount = args.find(arg => typeof arg === 'number');

        if (!targetUser || !amount) {
            return message.reply('**Uso correto:** `k pix @usuario valor` ou responda a uma mensagem com `kpix valor`.');
        }

        if (targetUser.id === message.author.id) {
            return message.reply('**Você não pode enviar dinheiro para si mesmo, chefe.**');
        }

        const sender = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (!sender || sender.bank < amount) {
            return message.reply(`**Saldo insuficiente no BANCO.**\nVocê só tem **$${(sender?.bank || 0).toLocaleString()}** guardados para transferência eletrónica.`);
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
            content: `# 🏦 TRANSFERÊNCIA PIX\n**Chefe, você confirma o envio de $${amount.toLocaleString()} para ${targetUser}?**`,
            components: [row]
        });
    }
};