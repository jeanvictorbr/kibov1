import { MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateExtratoCanvas } from '../../../utils/canvasExtrato.js';

export default {
    customId: 'extrato_nav',
    execute: async (interaction, client) => {
        const [_, __, ownerId, pageStr] = interaction.customId.split('_');
        const page = parseInt(pageStr);

        // A TRAVA AMIGÁVEL
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ 
                content: 'Ei, chefe! Esse extrato é pessoal. Use `k extrato` para ver o seu próprio.', 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        // Busca a nova página
        const skip = (page - 1) * 8;
        const transacoes = await prisma.transaction.findMany({
            where: { OR: [{ fromUserId: ownerId }, { toUserId: ownerId }] },
            orderBy: { timestamp: 'desc' },
            take: 8,
            skip: skip
        });

        // Prepara os dados pro Canvas igualzinho no comando inicial
        const transacoesComInfo = await Promise.all(transacoes.map(async (t) => {
            const isSender = t.fromUserId === ownerId;
            const otherId = isSender ? t.toUserId : t.fromUserId;
            let user = { username: "Desconhecido", avatar: "https://cdn.discordapp.com/embed/avatars/0.png" };
            try {
                const fetched = await client.users.fetch(otherId);
                user = { username: fetched.username, avatar: fetched.displayAvatarURL({ extension: 'png' }) };
            } catch (e) {}
            
            return { ...t, name: user.username, avatar: user.avatar };
        }));
        
        // Gera o buffer com a página atual
        const buffer = await generateExtratoCanvas(interaction.user, transacoesComInfo, page);
        const attachment = new AttachmentBuilder(buffer, { name: 'extrato_page.png' });

        // Cria novos botões de navegação desativando se estiver na pág 1 ou na última
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`extrato_nav_${ownerId}_${page - 1}`)
                .setLabel('⬅️ Anterior')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page <= 1),
            new ButtonBuilder()
                .setCustomId(`extrato_nav_${ownerId}_${page + 1}`)
                .setLabel('Próximo ➡️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(transacoes.length < 8) // Se veio menos de 8 itens, é a última página
        );

        // Atualiza a mensagem com o novo Canvas e botões atualizados
        await interaction.update({ 
            files: [attachment], 
            components: [row] 
        });
    }
};