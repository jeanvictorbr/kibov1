import { prisma } from '../../../core/database.js';

export default {
    customId: 'crash_stop',
    execute: async (interaction) => {
        const [_, __, ownerId, aposta, mult] = interaction.customId.split('_');
        
        if (interaction.user.id !== ownerId) return interaction.reply({ content: 'Tira a mão, não é sua aposta!', ephemeral: true });

        const ganho = Math.floor(parseFloat(aposta) * parseFloat(mult));

        // Adiciona o ganho na CARTEIRA (balance)
        await prisma.user.update({
            where: { userId: ownerId },
            data: { balance: { increment: ganho } }
        });

        await interaction.update({ 
            content: `# ✅ CASHOUT!\n**Você parou em ${mult}x e lucrou $${ganho.toLocaleString()} na sua CARTEIRA.**`, 
            files: [], 
            components: [] 
        });
    }
};