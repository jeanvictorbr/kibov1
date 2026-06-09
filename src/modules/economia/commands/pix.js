import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    name: 'pix',
    execute: async (message, args, client, reply, targetUser) => {
        // Encontra qualquer argumento que seja um número (graças ao nosso parser universal)
        const amount = args.find(arg => typeof arg === 'number');

        if (!targetUser || !amount) {
            return reply({ description: 'Chefe, use: `k pix @usuario valor` ou responda a uma mensagem com `kpix valor`.' });
        }

        if (targetUser.id === message.author.id) return reply({ description: 'Você não pode enviar dinheiro para si mesmo, chefe.' });

        // Verificação de saldo
        const sender = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (!sender || sender.balance < amount) return reply({ description: 'Saldo insuficiente para essa transação.' });

        // Botões
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`pix_confirm_${targetUser.id}_${amount}`).setLabel('Confirmar Pix').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('pix_cancel').setLabel('Cancelar').setStyle(ButtonStyle.Danger)
        );

        await message.channel.send({
            content: `Chefe, você confirma a transferência de **$${amount.toLocaleString()}** para ${targetUser}?`,
            components: [row]
        });
    }
};