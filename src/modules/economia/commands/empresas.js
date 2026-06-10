import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generatePortfolioCanvas } from '../../../utils/canvasEmpresas.js';

export default {
    name: 'empresas',
    execute: async (message) => {
        const userId = message.author.id;
        
        const myBusinesses = await prisma.userBusiness.findMany({ where: { userId } });
        
        const buffer = await generatePortfolioCanvas(message.author, myBusinesses);
        const attachment = new AttachmentBuilder(buffer, { name: 'portfolio.png' });

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`emp_action_market_${userId}`).setLabel('🛒 Mercado Oficial').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`emp_action_collect_${userId}`).setLabel('💵 Coletar Lucros Diários').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`emp_action_sell_${userId}`).setLabel('🏷️ Anunciar Negócio').setStyle(ButtonStyle.Secondary)
        );
        
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`emp_action_blackmarket_${userId}`).setLabel('🏴‍☠️ Mercado Negro (Comprar de Jogadores)').setStyle(ButtonStyle.Danger)
        );

        await message.reply({ files: [attachment], components: [row1, row2] });
    }
};