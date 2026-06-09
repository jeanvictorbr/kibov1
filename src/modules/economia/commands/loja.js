import { EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    name: 'loja',
    execute: async (message) => {
        const items = await prisma.shopItem.findMany();
        
        const embed = new EmbedBuilder()
            .setTitle('🛒 LOJA DO KIBO')
            .setColor('#3498db')
            .setDescription('Compre itens para vantagens exclusivas!');

        items.forEach(item => {
            embed.addFields({ name: `${item.name} - $${item.price}`, value: item.description });
        });

        message.reply({ embeds: [embed] });
    }
};