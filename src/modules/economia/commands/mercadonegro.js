import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { businesses } from '../../../utils/businessConfig.js';

export default {
    name: 'mercadonegro',
    execute: async (message) => {
        const userId = message.author.id;

        // 1. Busca negócios à venda que NÃO são do usuário atual (P2P)
        const forSale = await prisma.userBusiness.findMany({ 
            where: { forSalePrice: { not: null }, userId: { not: userId } }
        });

        // 2. Monta a vitrine de itens ilegais do Bot (NPC)
        let texto = `🌑 **MERCADO NEGRO DA CIDADE** 🌑\n\n` +
        `Bem-vindo à biqueira digital, chefe. Aqui você acha de tudo: equipamento pesado do cartel e empresas lavadas de outros magnatas.\n\n` +
        `🧨 **EQUIPAMENTOS (Compre usando \`k comprar [item]\`)**\n` +
        `> \`c4\` - **C4 Militar** | Preço: **$150.000** (Necessário pro \`k carroforte\`)\n\n` +
        `🏢 **AÇÕES CLANDESTINAS (Mercado de Jogadores)**\n`;

        // Se não tiver empresa de jogador à venda, manda só a loja de itens
        if (forSale.length === 0) {
            texto += `*🏴‍☠️ O mercado de empresas está vazio no momento ou você é o único anunciante.*`;
            return message.reply({ content: texto });
        }

        texto += `*Escolha uma empresa no menu abaixo para comprar e transferir pro seu nome. O bot garante o pagamento.*`;

        // 3. Cria o menu de seleção com as empresas dos jogadores
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`emp_action_buyplayer_${userId}`) // Trava de segurança no ID
            .setPlaceholder('Comprar negócio inflacionado de um jogador...')
            .addOptions(
                forSale.map(b => {
                    const config = businesses[b.businessId];
                    return {
                        label: `${config.name.toUpperCase()} ($${b.forSalePrice.toLocaleString()})`,
                        value: b.id.toString(),
                        description: `Vendedor ID: ${b.userId.substring(0, 8)}... | Lucro: +$${config.revenue.toLocaleString()} | Custo: -$${config.maintenance.toLocaleString()}`
                    };
                })
            );

        await message.reply({ 
            content: texto, 
            components: [new ActionRowBuilder().addComponents(menu)] 
        });
    }
};