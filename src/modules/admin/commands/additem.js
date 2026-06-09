import { prisma } from '../../../core/database.js';

export default {
    name: 'additem',
    execute: async (message, args) => {
        // Trava de segurança para o dono
        if (message.author.id !== process.env.DEVELOPER_ID) return;

        // Uso: k additem Nome Preço Descrição
        const [name, price, ...descArr] = args;
        const description = descArr.join(' ');

        await prisma.shopItem.create({
            data: { name, price: parseInt(price), description, type: 'UTILITY' }
        });

        message.reply(`✅ Item **${name}** adicionado à loja por $${price}!`);
    }
};