// src/modules/economia/components/job_select.js
import { prisma } from '../../../core/database.js';

export default {
    customId: 'job_select',
    execute: async (interaction) => {
        const [_, __, ownerId] = interaction.customId.split('_');
        
        // Trava: só quem deu o comando usa
        if (interaction.user.id !== ownerId) return interaction.reply({ content: 'Tira a mão, o emprego é dele!', ephemeral: true });

        const job = interaction.values[0];
        
        await prisma.user.update({
            where: { userId: interaction.user.id },
            data: { currentJob: job, jobStartedAt: new Date() }
        });

        // O menu some porque enviamos uma nova mensagem sem componentes
        await interaction.update({ 
            content: `# 📜 CONTRATO ASSINADO!\n**Cargo: ${job.toUpperCase()}**\nVocê está preso a este trabalho por 3 dias. Use \`k executar\` para trabalhar.`, 
            components: [] 
        });
    }
};