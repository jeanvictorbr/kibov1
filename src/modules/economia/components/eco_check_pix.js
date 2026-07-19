import { prisma } from '../../../core/database.js';
import { generatePixReceipt } from '../../../utils/canvasRecibo.js';
import { AttachmentBuilder, MessageFlags } from 'discord.js';

export default {
    customId: 'pix_confirm',
    execute: async (interaction) => {
        // 1. O SEGREDO: Pegamos o 'client' direto da interação!
        const client = interaction.client;
        
        const [_, __, senderId, targetId, amountStr] = interaction.customId.split('_');
        const amount = parseFloat(amountStr);

        // 2. Trava de segurança imediata
        if (interaction.user.id !== senderId) {
            return interaction.reply({ 
                content: '❌ Tira o olho, chefe! Esse Pix não é seu.', 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        // 3. Avisa o Discord que vamos demorar um pouco (gerar Canvas pesa)
        await interaction.deferUpdate();

        try {
            // Atualiza/Cria o Remetente e Destinatário
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

            // Registrar a transação e PEGAR O ID DELA
            const transacao = await prisma.transaction.create({
                data: { fromUserId: senderId, toUserId: targetId, amount: amount }
            });

            // 4. AQUI O ERRO SUMIU! Agora o 'client' existe e funciona.
            const targetUser = await client.users.fetch(targetId);
            
            // Usa a NOVA FUNÇÃO de Recibo Bancário! 
            const receiptBuffer = await generatePixReceipt(interaction.user, targetUser, amount, transacao.id.split('-')[0]);
            const attachment = new AttachmentBuilder(receiptBuffer, { name: 'comprovante_pix.png' });

            // 5. Como usamos deferUpdate(), alteramos a mensagem original com editReply
            await interaction.editReply({ 
                content: `✅ **Transferência de $${amount.toLocaleString('pt-BR')} confirmada com sucesso!**`, 
                components: [] 
            });
            
            // Mandamos a imagem como uma mensagem anexa embaixo
            await interaction.followUp({ 
                content: 'Aqui está o seu comprovante bancário:', 
                files: [attachment] 
            });

        } catch (error) {
            console.error("Erro no processamento do Pix:", error);
            // Tratamento de erro seguro
            await interaction.followUp({ 
                content: '❌ Erro interno ao processar o PIX.', 
                flags: [MessageFlags.Ephemeral] 
            }).catch(() => {});
        }
    }
};