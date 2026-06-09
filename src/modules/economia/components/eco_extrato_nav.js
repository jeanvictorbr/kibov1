import { MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateExtratoCanvas } from '../../../utils/canvasExtrato.js';
import { AttachmentBuilder } from 'discord.js';

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

        // ... (código para montar o buffer como no comando acima) ...
        
        // Atualiza a mensagem com o novo Canvas e botões atualizados
        await interaction.update({ 
            files: [new AttachmentBuilder(buffer)], 
            components: [/* nova row com botões atualizados */] 
        });
    }
};