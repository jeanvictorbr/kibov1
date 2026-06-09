import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    name: 'pix',
    execute: async (message, args, client, reply, targetUser) => {
        // Encontra qualquer argumento que seja um número (graças ao nosso parser)
        const amount = args.find(arg => typeof arg === 'number');

        if (!targetUser || !amount) {
            return reply({ description: 'Chefe, use: `k pix @usuario valor` ou responda a uma mensagem com `kpix valor`.' });
        }

        if (targetUser.id === message.author.id) return reply({ description: 'Você não pode enviar dinheiro para si mesmo, chefe.' });

        // Verificação de saldo no BANCO (Nova Regra)
        const sender = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (!sender || sender.bank < amount) {
            return reply({ description: `Saldo insuficiente no **Banco**. Você só tem **$${(sender?.bank || 0).toLocaleString()}** guardados.` });
        }

        // Botões (Agora com o ID do remetente embutido por segurança)
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

        await message.channel.send({
            content: `Chefe, você confirma a transferência de **$${amount.toLocaleString()}** do seu cofre para ${targetUser}?`,
            components: [row]
        });
    }
};