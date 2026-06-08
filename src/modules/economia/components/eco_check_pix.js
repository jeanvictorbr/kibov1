import { prisma } from '../../../core/database.js';
import { generateReceipt } from '../../../utils/canvasRecibo.js';
import { AttachmentBuilder } from 'discord.js';

export default {
    customId: 'pix_confirm', // O loader busca por este ID
    execute: async (interaction, client) => {
        const [_, __, targetId, amountStr] = interaction.customId.split('_');
        const amount = parseFloat(amountStr);

        // Segurança: verificar se quem clicou é quem iniciou
        if (interaction.user.id !== interaction.message.interaction.user.id) {
            return interaction.reply({ content: 'Este botão não é para si, chefe!', ephemeral: true });
        }

        // Transação
        const sender = await prisma.user.update({
            where: { userId: interaction.user.id },
            data: { balance: { decrement: amount } }
        });
        
        await prisma.user.update({
            where: { userId: targetId },
            data: { balance: { increment: amount } }
        });

        // Registrar transação
        await prisma.transaction.create({
            data: { fromUserId: interaction.user.id, toUserId: targetId, amount: amount }
        });

        // Recibo "Coisa Fina"
        const targetUser = await client.users.fetch(targetId);
        const receiptBuffer = await generateReceipt(interaction.user, targetUser, amount);
        const attachment = new AttachmentBuilder(receiptBuffer, { name: 'recibo.png' });

        await interaction.update({ content: `✅ Transferência confirmada!`, components: [] });
        await interaction.followUp({ content: 'Aqui está o seu recibo:', files: [attachment] });
    }
};