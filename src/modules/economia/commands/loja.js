import { AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateLojaCanvas } from '../../../utils/canvasLoja.js';

export default {
    name: 'loja',
    execute: async (message) => {
        const items = await prisma.shopItem.findMany();
        const buffer = await generateLojaCanvas(items);
        const attachment = new AttachmentBuilder(buffer, { name: 'loja.png' });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`loja_select_${message.author.id}`)
                .setPlaceholder('Escolha um item para comprar...')
                .addOptions(items.map(i => ({ label: i.name, value: i.name, description: `$${i.price}` })))
        );

        await message.reply({ files: [attachment], components: [row] });
    }
};