import { prisma } from '../../../core/database.js';

export default {
    name: 'comprar',
    execute: async (message, args) => {
        const itemName = args.join(' ');
        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        const item = await prisma.shopItem.findUnique({ where: { name: itemName } });

        if (!item) return message.reply('Esse item não existe na loja, chefe.');
        if (user.balance < item.price) return message.reply('Tá pobre? Trabalhe mais!');

        // Transação: Desconta dinheiro e adiciona ao inventário
        await prisma.$transaction([
            prisma.user.update({ where: { userId: message.author.id }, data: { balance: { decrement: item.price } } }),
            prisma.inventory.create({ data: { userId: message.author.id, itemId: item.name } })
        ]);

        message.reply(`✅ Você comprou, **${item.name}** com sucesso!`);
    }
};