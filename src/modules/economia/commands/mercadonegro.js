import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { businesses } from '../../../utils/businessConfig.js';

export default {
    name: 'mercadonegro',
    execute: async (message) => {
        const userId = message.author.id;

        // 1. Busca negócios à venda que NÃO são do usuário atual
        // Trava: Você não pode ver ou comprar suas próprias empresas anunciadas.
        const forSale = await prisma.userBusiness.findMany({ 
            where: { forSalePrice: { not: null }, userId: { not: userId } }
        });

        if (forSale.length === 0) {
            return message.reply('🏴‍☠️ **O Mercado Negro está vazio ou você é o único que anunciou!**\nLembre-se: Você não pode ver ou comprar os seus próprios anúncios.');
        }

        // 2. Cria o menu de seleção com os itens dos jogadores
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`emp_action_buyplayer_${userId}`) // Manda a ação pro carregador de empresas
            .setPlaceholder('Comprar negócio inflacionado de um jogador...')
            .addOptions(
                forSale.map(b => {
                    const config = businesses[b.businessId];
                    return {
                        label: `${config.name.toUpperCase()} ($${b.forSalePrice.toLocaleString()})`,
                        value: b.id,
                        // Mostra infos completas: Dono ID, Lucro e Custo.
                        description: `Vendedor ID: ${b.userId.substring(0, 8)}... | Lucro: +$${config.revenue.toLocaleString()} | Custo: -$${config.maintenance.toLocaleString()}`
                    };
                })
            );

        await message.reply({ 
            content: '# 🏴‍☠️ MERCADO CLANDESTINO (P2P)\nAqui os magnatas vendem suas ações pelo preço que quiserem. A transferência é instantânea e o bot garante o pagamento.', 
            components: [new ActionRowBuilder().addComponents(menu)] 
        });
    }
};