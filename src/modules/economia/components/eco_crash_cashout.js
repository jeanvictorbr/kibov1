// src/modules/economia/components/eco_crash_cashout.js
import { prisma } from '../../../core/database.js';

export default {
    customId: 'crash_cashout',
    execute: async (interaction) => {
        const [_, __, ownerId, amountStr] = interaction.customId.split('_');
        
        // TRAVA: Só o autor do comando pode clicar
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: 'Tira a mão! A aposta não é sua.', ephemeral: true });
        }

        const amount = parseFloat(amountStr);
        const ganho = Math.floor(amount * 2.0); // Ajuste o multiplicador conforme desejado

        await prisma.user.update({
            where: { userId: ownerId },
            data: { balance: { increment: ganho } }
        });

        await interaction.update({ content: `✅ **CASHOUT! Ganhaste $${ganho.toLocaleString()}**`, components: [] });
    }
};