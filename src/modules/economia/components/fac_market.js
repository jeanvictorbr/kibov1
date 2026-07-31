import { MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { FACTION_ITEMS } from '../../../utils/factionItems.js';

export default {
    customId: 'fac_market',
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        // ['fac', 'market', userId]
        const ownerId = parts[2];

        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: 'Não é teu menu, chefe! Dá teu próprio `k fac mercado`.', flags: [MessageFlags.Ephemeral] });
        }

        const listingId = interaction.values[0];
        const listing = await prisma.factionListing.findUnique({
            where: { id: listingId },
            include: { faction: true }
        });

        if (!listing) {
            return interaction.reply({ content: '❌ Esse anúncio já foi comprado ou removido!', flags: [MessageFlags.Ephemeral] });
        }

        const item = FACTION_ITEMS[listing.itemId];
        if (!item) {
            return interaction.reply({ content: '❌ Item desconhecido nesse anúncio!', flags: [MessageFlags.Ephemeral] });
        }

        const total = listing.price * listing.qty;
        const buyer = await prisma.user.upsert({
            where: { userId: ownerId },
            update: {},
            create: { userId: ownerId }
        });

        if (buyer.balance < total) {
            return interaction.reply({ content: `❌ Você não tem **$${total.toLocaleString('pt-BR')}** na carteira pra comprar isso!`, flags: [MessageFlags.Ephemeral] });
        }

        // Não deixa comprar da própria facção
        const myMember = await prisma.factionMember.findFirst({ where: { userId: ownerId } });
        if (myMember && myMember.factionId === listing.factionId) {
            return interaction.reply({ content: '🏴‍☠️ Não pode comprar do próprio estoque, traficante! Vende pra gente de fora.', flags: [MessageFlags.Ephemeral] });
        }

        // Realiza a compra
        await prisma.$transaction([
            prisma.user.update({ where: { userId: ownerId }, data: { balance: { decrement: total } } }),
            prisma.faction.update({ where: { id: listing.factionId }, data: { bank: { increment: total } } }),
            prisma.factionListing.delete({ where: { id: listing.id } })
        ]);

        // Adiciona no inventário do comprador
        const existingItem = await prisma.inventory.findFirst({
            where: { userId: ownerId, itemId: item.name }
        });
        if (existingItem) {
            await prisma.inventory.update({ where: { id: existingItem.id }, data: { amount: { increment: listing.qty } } });
        } else {
            await prisma.inventory.create({
                data: { userId: ownerId, itemId: item.name, amount: listing.qty }
            });
        }

        return interaction.reply({
            content: `✅ **COMPRA REALIZADA!**\n${item.emoji} **${item.name}** × ${listing.qty} por **$${total.toLocaleString('pt-BR')}**.\nA mercadoria foi pro seu inventário — use com \`k usar\`!\n💵 O dinheiro foi pro caixa da **${listing.faction.name}** [${listing.faction.tag}].`,
            flags: [MessageFlags.Ephemeral]
        });
    }
};
