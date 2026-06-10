import { AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { businesses } from '../../../utils/businessConfig.js';
import { generateMarketCanvas } from '../../../utils/canvasEmpresas.js';

export default {
    name: 'mercado',
    execute: async (message) => {
        const userId = message.author.id;
        
        // 1. Busca QUAIS empresas imobiliárias já têm dono
        const allOwned = await prisma.userBusiness.findMany();
        const ownedIds = allOwned.map(b => b.businessId);

        // 2. Gera a NOVA IMAGEM de duas colunas quadrada
        const buffer = await generateMarketCanvas(ownedIds);
        const attachment = new AttachmentBuilder(buffer, { name: 'market.png' });

        // 3. Só mostra no select menu as que NÃO têm dono (Exclusividade)
        // Usamos businesses (imóveis), não ShopItem (itens de loja).
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
                .setCustomId(`emp_action_buy_${userId}`) // Manda a ação pro carregador de empresas
                .setPlaceholder('Selecione a empresa para comprar do Mercado Oficial...')
                .addOptions(availableOptions);
            components.push(new ActionRowBuilder().addComponents(menu));
        }

        await message.reply({ 
            content: availableOptions.length === 0 ? '⚠️ **Todas as empresas já têm dono!** Fique de olho, alguma pode falir a qualquer momento.' : '',
            files: [attachment], 
            components: components 
        });
    }
};