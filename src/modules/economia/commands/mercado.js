import { AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { businesses } from '../../../utils/businessConfig.js';
import { generateMarketCanvas } from '../../../utils/canvasEmpresas.js';

export default {
    name: 'mercado',
    execute: async (message) => {
        const userId = message.author.id;
        
        // Busca QUAIS empresas já têm dono
        const allOwned = await prisma.userBusiness.findMany();
        const ownedIds = allOwned.map(b => b.businessId);

        // Gera a imagem do catálogo
        const buffer = await generateMarketCanvas(ownedIds);
        const attachment = new AttachmentBuilder(buffer, { name: 'market.png' });

        // Só mostra no select menu as que NÃO têm dono
        const availableOptions = Object.keys(businesses)
            .filter(k => !ownedIds.includes(k))
            .map(k => ({
                label: businesses[k].name,
                value: k,
                description: `Preço: $${businesses[k].price.toLocaleString()}`
            }));

        const components = [];
        if (availableOptions.length > 0) {
            const menu = new StringSelectMenuBuilder()
                .setCustomId(`emp_action_buy_${userId}`) // Manda a ação pro emp_action.js
                .setPlaceholder('Selecione a empresa para comprar...')
                .addOptions(availableOptions);
            components.push(new ActionRowBuilder().addComponents(menu));
        }

        await message.reply({ 
            content: availableOptions.length === 0 ? '⚠️ **Todas as empresas já têm dono!** Fique de olho, alguma pode falir a qualquer momento e voltar ao mercado.' : '',
            files: [attachment], 
            components: components 
        });
    }
};