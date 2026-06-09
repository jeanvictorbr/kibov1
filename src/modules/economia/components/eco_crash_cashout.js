import { prisma } from '../../../core/database.js';

export default {
    customId: 'crash_cashout',
    execute: async (interaction) => {
        const [_, __, ownerId, amountStr] = interaction.customId.split('_');
        if (interaction.user.id !== ownerId) return interaction.reply({ content: 'Tira a mão, não é sua aposta!', ephemeral: true });

        const amount = parseFloat(amountStr);
        const mult = 2.0; // Exemplo fixo: quem para, dobra! (Você pode pegar o mult da mensagem se quiser)
        const ganho = Math.floor(amount * mult);

        await prisma.user.update({
            where: { userId: ownerId },
            data: { balance: { increment: ganho } }
        });

        await interaction.update({ content: `# ✅ CASHOUT!\n**Você parou em ${mult}x e ganhou $${ganho.toLocaleString()}!**`, components: [] });
    }
};