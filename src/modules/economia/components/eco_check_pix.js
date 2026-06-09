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
            // 1. O UPSERT PODEROSO: Atualiza se existir, CRIA se não existir!
            await prisma.user.upsert({
                where: { userId: senderId },
                update: { bank: { decrement: amount } },
                create: { userId: senderId, bank: -amount } 
            });
            
            await prisma.user.upsert({
                where: { userId: targetId },
                update: { bank: { increment: amount } },
                create: { userId: targetId, bank: amount }
            });

            // 2. Registrar transação no extrato
            await prisma.transaction.create({
                data: { fromUserId: senderId, toUserId: targetId, amount: amount }
            });

            const targetUser = await client.users.fetch(targetId);
            
            // 3. A CORREÇÃO: Ordem certa dos argumentos (Comprador, Valor, "Nome do Produto")
            const receiptBuffer = await generateReceipt(interaction.user, amount, `PIX: ${targetUser.username}`);
            const attachment = new AttachmentBuilder(receiptBuffer, { name: 'recibo_pix.png' });

            await interaction.update({ content: `✅ **Transferência de $${amount.toLocaleString()} confirmada com sucesso!**`, components: [] });
            await interaction.followUp({ content: 'Aqui está o seu comprovante bancário:', files: [attachment] });

        } catch (error) {
            console.error("Erro no processamento do Pix:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erro ao processar o PIX.', flags: [MessageFlags.Ephemeral] });
            }
        }
    }
};