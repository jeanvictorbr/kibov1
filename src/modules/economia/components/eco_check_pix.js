import { prisma } from '../../../core/database.js';
import { generateReceipt } from '../../../utils/canvasRecibo.js';
import { AttachmentBuilder } from 'discord.js';

export default {
    customId: 'pix_confirm', // O loader busca por este prefixo
    execute: async (interaction, client) => {
        // Agora recebemos: pix_confirm_SENDERID_TARGETID_AMOUNT
        const [_, __, senderId, targetId, amountStr] = interaction.customId.split('_');
        const amount = parseFloat(amountStr);

        // Segurança blindada: Verifica se quem clicou é o verdadeiro dono do dinheiro
        if (interaction.user.id !== senderId) {
            return interaction.reply({ content: 'Tira o olho, chefe! Esse Pix não é seu.', ephemeral: true });
        }

        try {
            // Desconta do BANCO de quem enviou
            await prisma.user.update({
                where: { userId: senderId },
                data: { bank: { decrement: amount } }
            });
            
            // Adiciona no BANCO de quem recebeu (Pix é transferência eletrônica)
            await prisma.user.update({
                where: { userId: targetId },
                data: { bank: { increment: amount } }
            });

            // Registrar transação no Extrato
            await prisma.transaction.create({
                data: { fromUserId: senderId, toUserId: targetId, amount: amount }
            });

            // Recibo Canvas "Coisa Fina"
            const targetUser = await client.users.fetch(targetId);
            const receiptBuffer = await generateReceipt(interaction.user, targetUser, amount);
            const attachment = new AttachmentBuilder(receiptBuffer, { name: 'recibo_pix.png' });

            // Apaga os botões e confirma
            await interaction.update({ content: `✅ **Pix de $${amount.toLocaleString()} enviado com sucesso!**`, components: [] });
            await interaction.followUp({ content: 'Aqui está o seu comprovante bancário:', files: [attachment] });

        } catch (error) {
            console.error("Erro no processamento do Pix:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Erro no servidor do banco central. Tente novamente mais tarde.', ephemeral: true });
            }
        }
    }
};