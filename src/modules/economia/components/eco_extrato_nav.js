import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { createEmbed } from '../../../utils/embedBuilder.js';

export default {
    customId: 'extrato_nav',
    execute: async (interaction) => {
        // Segurança: só quem deu o comando pode clicar
        if (interaction.user.id !== interaction.message.interaction.user.id) 
            return interaction.reply({ content: 'Toca a sua carteira, chefe! Só o dono pode navegar aqui.', ephemeral: true });

        const [_, __, targetId, pageStr] = interaction.customId.split('_');
        const page = parseInt(pageStr);
        const take = 10;
        const skip = (page - 1) * take;

        const transacoes = await prisma.transaction.findMany({
            where: { OR: [{ fromUserId: targetId }, { toUserId: targetId }] },
            orderBy: { timestamp: 'desc' },
            take,
            skip
        });

        let desc = transacoes.map(t => 
            `**${t.fromUserId === targetId ? '📤 Enviou' : '📥 Recebeu'}** $${t.amount.toLocaleString()} - ${new Date(t.timestamp).toLocaleDateString()}`
        ).join('\n') || "Fim do extrato, chefe.";

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`extrato_nav_${targetId}_${page - 1}`).setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(page === 1),
            new ButtonBuilder().setCustomId(`extrato_nav_${targetId}_${page + 1}`).setLabel('➡️').setStyle(ButtonStyle.Secondary)
        );

        const embed = createEmbed({ title: `Extrato (Pág ${page})`, description: desc });
        await interaction.update({ embeds: [embed], components: [row] });
    }
};