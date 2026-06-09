import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateExtratoCanvas } from '../../../utils/canvasExtrato.js';

export default {
    name: 'extrato',
    execute: async (message, args, client, reply, targetUser) => {
        // Se for Dev e tiver alvo, puxa do alvo. Se não, puxa do dono do comando.
        let targetId = message.author.id;
        let targetObj = message.author;
        
        if (targetUser && message.author.id === process.env.DEVELOPER_ID) {
            targetId = targetUser.id;
            targetObj = targetUser;
        }

        const page = 1;
        const take = 7; // Quantidade perfeita que cabe no nosso Canvas
        const skip = (page - 1) * take;

        const transacoes = await prisma.transaction.findMany({
            where: { OR: [{ fromUserId: targetId }, { toUserId: targetId }] },
            orderBy: { timestamp: 'desc' },
            take,
            skip
        });

        // Gera a Arte
        const buffer = await generateExtratoCanvas(targetObj, transacoes, page);
        const attachment = new AttachmentBuilder(buffer, { name: 'extrato.png' });

        // Botões de Navegação
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`extrato_nav_${targetId}_${page - 1}`).setLabel('⬅️ Anterior').setStyle(ButtonStyle.Secondary).setDisabled(page === 1),
            new ButtonBuilder().setCustomId(`extrato_nav_${targetId}_${page + 1}`).setLabel('Próxima ➡️').setStyle(ButtonStyle.Secondary).setDisabled(transacoes.length < take)
        );

        await message.channel.send({ files: [attachment], components: [row] });
    }
};