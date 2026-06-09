import { prisma } from '../../../core/database.js';
import { generateReceipt } from '../../../utils/canvasRecibo.js';
import { AttachmentBuilder, MessageFlags } from 'discord.js';

export default {
    customId: 'pix_confirm',
    execute: async (interaction, client) => {
        const [_, __, senderId, targetId, amountStr] = interaction.customId.split('_');
        const amount = parseFloat(amountStr);

        if (interaction.user.id !== senderId) {
            return interaction.reply({ content: 'Tira o olho, chefe! Esse Pix não é seu.', flags: [MessageFlags.Ephemeral] });
        }

        try {
            // 1. Atualiza/Cria o Remetente (Garante que existe)
            await prisma.user.upsert({
                where: { userId: senderId },
                update: { bank: { decrement: amount } },
                create: { userId: senderId, bank: -amount } // Caso bizarro: se o remetente não existir, ele vai ter saldo negativo, mas o Prisma precisa de um valor.
            });
            
            // 2. Atualiza/Cria o Destinatário (Se ele nunca usou o bot, ele vai ser criado agora com o saldo recebido)
            await prisma.user.upsert({
                where: { userId: targetId },
                update: { bank: { increment: amount } },
                create: { userId: targetId, bank: amount }
            });

            // Registrar transação
            await prisma.transaction.create({
                data: { fromUserId: senderId, toUserId: targetId, amount: amount }
            });

            const targetUser = await client.users.fetch(targetId);
            const receiptBuffer = await generateReceipt(interaction.user, targetUser, amount);
            const attachment = new AttachmentBuilder(receiptBuffer, { name: 'recibo.png' });

            await interaction.update({ content: `✅ **Transferência de $${amount.toLocaleString()} confirmada com sucesso!**`, components: [] });
            await interaction.followUp({ content: 'Aqui está o seu recibo:', files: [attachment] });

        } catch (error) {
            console.error("Erro no processamento do Pix:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erro no banco de dados. O utilizador destino nunca interagiu com o bot?', flags: [MessageFlags.Ephemeral] });
            }
        }
    }
};