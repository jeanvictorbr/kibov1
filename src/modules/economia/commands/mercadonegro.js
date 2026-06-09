import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { businesses } from '../../../utils/businessConfig.js';

export default {
    name: 'mercadonegro',
    execute: async (message) => {
        const userId = message.author.id;

        // Busca negócios à venda que NÃO são do usuário atual
        const forSale = await prisma.userBusiness.findMany({ 
            where: { forSalePrice: { not: null }, userId: { not: userId } }
        });

        if (forSale.length === 0) {
            return message.reply('🏴‍☠️ O Mercado Negro está vazio. Ninguém está vendendo negócios no momento.');
        }

        // Cria o menu de seleção com os itens dos jogadores
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`emp_action_buyplayer_${userId}`) // Manda a ação pro emp_action.js
            .setPlaceholder('Comprar empresa de um jogador...')
            .addOptions(
                forSale.map(b => ({
                    label: businesses[b.businessId].name,
                    value: b.id,
                    description: `Dono ID: ${b.userId.substring(0, 8)}... | Valor: $${b.forSalePrice.toLocaleString()}`
                }))
            );

        await message.reply({ 
            content: '# 🏴‍☠️ MERCADO CLANDESTINO\nAqui os jogadores vendem seus negócios inflacionados. A transferência é instantânea.', 
            components: [new ActionRowBuilder().addComponents(menu)] 
        });
    }
};