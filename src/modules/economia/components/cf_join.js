import { MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    customId: 'cf_join',
    execute: async (interaction) => {
        const userId = interaction.user.id;
        const msgId = interaction.message.id;

        const data = global.activeCarroForte.get(msgId);
        if (!data) return interaction.reply({ content: '❌ O assalto já acabou, chefe!', flags: [MessageFlags.Ephemeral] });

        const userDb = await prisma.user.findUnique({ where: { userId } });
        if (!userDb || userDb.currentJob !== 'ladrao') {
            return interaction.reply({ content: '🛑 Sai fora, paisano! Só `Ladrão` entra na linha de tiro do Carro Forte!', flags: [MessageFlags.Ephemeral] });
        }

        if (data.crew.includes(userId)) {
            return interaction.reply({ content: '🔫 Você já tá com o fuzil na mão, parceiro! Segura a posição!', flags: [MessageFlags.Ephemeral] });
        }

        // Bota o mano no bonde
        data.crew.push(userId);

        await interaction.reply({ content: '🥷 **Você entrou pro bonde!** Engatilha a arma, esconde o rosto e mete bala se a PM aparecer!', flags: [MessageFlags.Ephemeral] });
    }
};