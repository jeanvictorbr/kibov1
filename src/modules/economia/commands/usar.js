import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    name: 'usar',
    execute: async (message) => {
        // Agrupa os itens e conta quantos tem de cada
        const inventory = await prisma.inventory.groupBy({
            by: ['itemId'],
            where: { userId: message.author.id },
            _count: { itemId: true }
        });

        if (inventory.length === 0) return message.reply('Você não tem nada no inventário, mano.');

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`usar_select_${message.author.id}`)
            .setPlaceholder('Escolha o item que deseja usar...')
            .addOptions(inventory.map(i => ({ 
                label: `${i.itemId} (x${i._count.itemId})`, 
                value: i.itemId 
            })));

        await message.reply({ content: '# 🎒 SEU INVENTÁRIO', components: [new ActionRowBuilder().addComponents(menu)] });
    }
};