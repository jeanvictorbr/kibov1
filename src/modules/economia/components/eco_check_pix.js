import { prisma } from '../../../core/database.js';
import { generatePixReceipt } from '../../../utils/canvasRecibo.js'; // Mudamos a importação
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
            // 1. Atualiza/Cria o Remetente e Destinatário
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

            // 2. Registrar a transação e PEGAR O ID DELA
            const transacao = await prisma.transaction.create({
                data: { fromUserId: senderId, toUserId: targetId, amount: amount }
            });

            const targetUser = await client.users.fetch(targetId);
            
            // 3. Usa a NOVA FUNÇÃO de Recibo Bancário! 
            // Usamos split('-')[0] para o ID não ficar gigante, pegando só os primeiros 8 caracteres do UUID.
            const receiptBuffer = await generatePixReceipt(interaction.user, targetUser, amount, transacao.id.split('-')[0]);
            const attachment = new AttachmentBuilder(receiptBuffer, { name: 'comprovante_pix.png' });

            await interaction.update({ content: `✅ **Transferência de $${amount.toLocaleString('pt-BR')} confirmada com sucesso!**`, components: [] });
            await interaction.followUp({ content: 'Aqui está o seu comprovante bancário:', files: [attachment] });

        } catch (error) {
            console.error("Erro no processamento do Pix:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erro ao processar o PIX.', flags: [MessageFlags.Ephemeral] });
            }
        }
    }
};