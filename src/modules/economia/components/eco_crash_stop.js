import { prisma } from '../../../core/database.js';

export default {
    customId: 'crash_stop',
    execute: async (interaction) => {
        // Formato customId: crash_stop_ID_APOSTA_MULT
        const parts = interaction.customId.split('_');
        const ownerId = parts[2];
        const aposta = parseFloat(parts[3]);
        const mult = parts[4]; // O multiplicador no momento do clique

        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: 'Tira a mão, não é sua aposta!', ephemeral: true });
        }

        const ganho = Math.floor(aposta * parseFloat(mult));

        await prisma.user.update({
            where: { userId: ownerId },
            data: { balance: { increment: ganho } }
        });

        // Atualiza a mensagem finalizando o jogo
        await interaction.update({ 
            content: `# ✅ CASHOUT!\n**Você parou em ${mult}x e lucrou $${ganho.toLocaleString()}!**`, 
            files: [], 
            components: [] 
        });
    }
};