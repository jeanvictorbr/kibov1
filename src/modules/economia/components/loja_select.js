import { prisma } from '../../../core/database.js';
import { generateReceipt } from '../../../utils/canvasRecibo.js';
import { AttachmentBuilder } from 'discord.js';

export default {
    customId: 'loja_select',
    execute: async (interaction) => {
        const [_, __, ownerId] = interaction.customId.split('_');
        if (interaction.user.id !== ownerId) return interaction.reply({ content: 'Tira a mão!', ephemeral: true });

        const itemName = interaction.values[0];
        const item = await prisma.shopItem.findUnique({ where: { name: itemName } });
        const user = await prisma.user.findUnique({ where: { userId: ownerId } });

        if (!item) return interaction.reply({ content: 'Item não encontrado.', ephemeral: true });
        if (user.balance < item.price) return interaction.reply({ content: 'Dinheiro insuficiente.', ephemeral: true });

        // Transação: Desconta dinheiro e adiciona ao inventário
        await prisma.$transaction([
            prisma.user.update({ where: { userId: ownerId }, data: { balance: { decrement: item.price } } }),
            prisma.inventory.create({ data: { userId: ownerId, itemId: itemName } })
        ]);

        // Gerando o recibo com o comprador, valor e nome do item corretamente
        const receiptBuffer = await generateReceipt(interaction.user, item.price, itemName);
        const attachment = new AttachmentBuilder(receiptBuffer, { name: 'recibo_loja.png' });

        await interaction.update({
            content: `# ✅ COMPRA REALIZADA\n**Item:** ${item.name}\n**Como usar:** Use \`k usar\` para abrir seu inventário e ativar o item.`,
            files: [attachment],
            components: []
        });
    }
};