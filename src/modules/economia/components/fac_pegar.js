import { MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { FACTION_ITEMS } from '../../../utils/factionItems.js';
import { getMemberOfUser, readEstoque, removeFromEstoque } from '../../../utils/factionService.js';

export default {
    customId: 'fac_pegar',
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const ownerId = parts[2];

        if (interaction.user.id !== ownerId) {
            return interaction.reply({
                content: 'Não é teu menu, chefe! Dá teu próprio `k fac pegar`.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const itemId = interaction.values[0];
        const userId = interaction.user.id;

        const member = await getMemberOfUser(userId);
        if (!member) {
            return interaction.reply({ content: '❌ Você não é de nenhuma facção!', flags: [MessageFlags.Ephemeral] });
        }
        if (member.rank === 'membro') {
            return interaction.reply({ content: '❌ Só Líder e Capo podem retirar itens do estoque da facção.', flags: [MessageFlags.Ephemeral] });
        }

        const faction = await prisma.faction.findUnique({ where: { id: member.factionId } });
        const estoque = readEstoque(faction);
        if (!estoque[itemId] || estoque[itemId] <= 0) {
            return interaction.reply({ content: '❌ Esse item não tá mais no estoque da facção!', flags: [MessageFlags.Ephemeral] });
        }

        const item = FACTION_ITEMS[itemId];
        if (!item) {
            return interaction.reply({ content: '❌ Item desconhecido nesse estoque!', flags: [MessageFlags.Ephemeral] });
        }

        // Move 1 unidade do estoque da fac pro inventário pessoal do líder/capo
        await removeFromEstoque(member.factionId, itemId, 1);

        const existingItem = await prisma.inventory.findFirst({
            where: { userId, itemId: item.name }
        });
        if (existingItem) {
            await prisma.inventory.update({ where: { id: existingItem.id }, data: { amount: { increment: 1 } } });
        } else {
            await prisma.inventory.create({
                data: { userId, itemId: item.name, amount: 1 }
            });
        }

        const restante = (estoque[itemId] || 0) - 1;
        const restanteMsg = restante > 0 ? `\n📦 Ainda tem **×${restante}** no estoque.` : '\n📦 O estoque desse item zerou!';

        return interaction.reply({
            content: `🎒 **ITEM RETIRADO!**\n${item.emoji} **${item.name}** × 1 foi pro teu inventário.\nUsa com \`k usar\` pra ativar o buff — ${item.desc}${restanteMsg}\n\n*Quer pegar em quantidade? Usa \`k fac pegar ${itemId} <qtd>\`.*`,
            flags: [MessageFlags.Ephemeral]
        });
    }
};
