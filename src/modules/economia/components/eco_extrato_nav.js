import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateExtratoCanvas } from '../../../utils/canvasExtrato.js';

export default {
    customId: 'extrato_nav',
    execute: async (interaction, client) => {
        const [_, __, targetId, pageStr] = interaction.customId.split('_');
        const page = parseInt(pageStr);

        // Segurança blindada (Só o dono da carteira ou o DEV podem clicar)
        if (interaction.user.id !== targetId && interaction.user.id !== process.env.DEVELOPER_ID) {
            return interaction.reply({ content: 'Toca a sua carteira, chefe! Só o dono pode navegar aqui.', ephemeral: true });
        }

        const take = 7;
        const skip = (page - 1) * take;

        const transacoes = await prisma.transaction.findMany({
            where: { OR: [{ fromUserId: targetId }, { toUserId: targetId }] },
            orderBy: { timestamp: 'desc' },
            take,
            skip
        });

        // Pega os dados de foto e nome para a arte
        let targetObj;
        try {
            targetObj = await client.users.fetch(targetId);
        } catch(e) { targetObj = interaction.user; }

        // Gera a Arte Nova
        const buffer = await generateExtratoCanvas(targetObj, transacoes, page);
        const attachment = new AttachmentBuilder(buffer, { name: 'extrato.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`extrato_nav_${targetId}_${page - 1}`).setLabel('⬅️ Anterior').setStyle(ButtonStyle.Secondary).setDisabled(page === 1),
            new ButtonBuilder().setCustomId(`extrato_nav_${targetId}_${page + 1}`).setLabel('Próxima ➡️').setStyle(ButtonStyle.Secondary).setDisabled(transacoes.length < take)
        );

        // Dá update na imagem atual
        await interaction.update({ files: [attachment], components: [row] });
    }
};