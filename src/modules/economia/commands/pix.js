import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateReceipt } from '../../../utils/canvasRecibo.js';

export default {
    name: 'pix',
    execute: async (message, args, client, reply) => {
        const target = message.mentions.users.first();
        const amount = args[1];

        if (!target || !amount || isNaN(amount)) {
            return reply({ description: 'Uso correto: `k pix @usuario valor`' });
        }

        if (target.id === message.author.id) return reply({ description: 'Você não pode enviar dinheiro para si mesmo, chefe.' });

        // Verificação de saldo
        const sender = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (!sender || sender.balance < amount) return reply({ description: 'Saldo insuficiente.' });

        // Botão de Confirmação
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`pix_confirm_${target.id}_${amount}`).setLabel('Confirmar Pix').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('pix_cancel').setLabel('Cancelar').setStyle(ButtonStyle.Danger)
        );

        await message.channel.send({
            content: `Chefe, você confirma a transferência de **$${amount}** para ${target}?`,
            components: [row]
        });
    }
};