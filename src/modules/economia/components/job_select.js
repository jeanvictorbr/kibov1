import { prisma } from '../../../core/database.js';

export default {
    customId: 'job_select',
    execute: async (interaction) => {
        const job = interaction.values[0];
        const now = new Date();

        await prisma.user.update({
            where: { userId: interaction.user.id },
            data: { currentJob: job, jobStartedAt: now }
        });

        await interaction.reply({ content: `✅ **Você agora é um ${job.toUpperCase()}!**\nVocê só poderá mudar de carreira em 3 dias.`, ephemeral: true });
    }
};