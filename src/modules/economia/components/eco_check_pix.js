import { prisma } from '../../../core/database.js';
import { generateReceipt } from '../../../utils/canvasRecibo.js';
import { AttachmentBuilder, MessageFlags } from 'discord.js';

export default {
    customId: 'pix_confirm',
    execute: async (interaction, client) => {
        const [_, __, senderId, targetId, amountStr] = interaction.customId.split('_');
        const amount = parseFloat(amountStr);

        if (interaction.user.id !== senderId) {
            // Forma moderna e sem avisos de erro no console
            return interaction.reply({ content: 'Tira o olho, chefe! Esse Pix não é seu.', flags: [MessageFlags.Ephemeral] });
        }

        try {
            await prisma.user.update({
                where: { userId: senderId },
                data: { bank: { decrement: amount } }
            });
            
            await prisma.user.update({
                where: { userId: targetId },
                data: { bank: { increment: amount } }
            });

            await prisma.transaction.create({
                data: { fromUserId: senderId, toUserId: targetId, amount: amount }
            });

            const targetUser = await client.users.fetch(targetId);
            const receiptBuffer = await generateReceipt(interaction.user, targetUser, amount);
            const attachment = new AttachmentBuilder(receiptBuffer, { name: 'recibo_pix.png' });

            await interaction.update({ content: `✅ **Pix de $${amount.toLocaleString()} enviado com sucesso!**`, components: [] });
            await interaction.followUp({ content: 'Aqui está o seu comprovante bancário:', files: [attachment] });

        } catch (error) {
            console.error("Erro no processamento do Pix:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Erro no servidor do banco central. Tente novamente mais tarde.', flags: [MessageFlags.Ephemeral] });
            }
        }
    }
};