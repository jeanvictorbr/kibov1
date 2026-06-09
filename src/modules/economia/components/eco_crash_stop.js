import { prisma } from '../../../core/database.js';

export default {
    customId: 'crash_stop',
    execute: async (interaction) => {
        const [_, __, ownerId, aposta, mult] = interaction.customId.split('_');
        
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: 'Tira a mão, não é a sua aposta!', flags: [64] });
        }

        const lucro = Math.floor(parseFloat(aposta) * parseFloat(mult));
        
        await prisma.user.update({
            where: { userId: ownerId },
            data: { balance: { increment: lucro } }
        });

        await interaction.update({ content: `# ✅ CASHOUT!\n**Você parou em ${mult}x e lucrou $${lucro.toLocaleString()}!**`, components: [] });
    }
};