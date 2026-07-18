import { prisma } from '../../../core/database.js';

export default {
    customId: 'crash_stop',
    execute: async (interaction) => {
        const [_, __, ownerId, aposta, mult] = interaction.customId.split('_');
        
        // 1. TRAVA: Como a interação já foi "adiada" (deferred), usamos followUp em vez de reply
        if (interaction.user.id !== ownerId) {
            return interaction.followUp({ 
                content: '❌ Tira a mão, não é sua aposta!', 
                flags: [ 64 ] // Flag 64 é o novo padrão do Discord para "ephemeral"
            });
        }

        const ganho = Math.floor(parseFloat(aposta) * parseFloat(mult));

        // 2. Adiciona o ganho na CARTEIRA (balance) do banco de dados
        await prisma.user.update({
            where: { userId: ownerId },
            data: { balance: { increment: ganho } }
        });

        // 3. SUCESSO: Como a interação já foi "adiada", usamos editReply em vez de update
        await interaction.editReply({ 
            content: `# ✅ CASHOUT!\n**Você parou em ${mult}x e lucrou $${ganho.toLocaleString('pt-BR')} na sua CARTEIRA.**`, 
            files: [], 
            components: [] 
        });
    }
};