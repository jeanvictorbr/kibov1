import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    name: 'usar',
    execute: async (message) => {
        const inventory = await prisma.inventory.findMany({ where: { userId: message.author.id } });
        if (inventory.length === 0) return message.reply('Seu inventário está vazio!');

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`usar_select_${message.author.id}`)
            .setPlaceholder('Qual item ativar?')
            .addOptions(inventory.map(i => ({ label: i.itemId, value: `${i.id}_${i.itemId}` })));

        await message.reply({ content: '# 🎒 SEU INVENTÁRIO', components: [new ActionRowBuilder().addComponents(menu)] });
    }
};