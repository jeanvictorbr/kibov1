import { AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { businesses } from '../../../utils/businessConfig.js';
import { generateMarketCanvas, generatePortfolioCanvas } from '../../../utils/canvasEmpresas.js';
import { parseAmount } from '../../../utils/parser.js';

export default {
    customId: 'emp_action', 
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const action = parts[2]; 
        const ownerId = parts[3]; 

        // Modals usam um formato diferente, então pulamos a trava de ID apenas para o envio do modal
        if (!action.startsWith('modalsell') && interaction.user.id !== ownerId) {
            return interaction.reply({ content: 'Esse painel não é seu, chefe.', ephemeral: true });
        }

        const userId = interaction.user.id;
        const userDb = await prisma.user.findUnique({ where: { userId } });

        const btnBack = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`emp_action_home_${userId}`).setLabel('⬅️ Voltar ao Início').setStyle(ButtonStyle.Secondary)
        );

        // 0. VOLTAR PARA HOME
        if (action === 'home') {
            const myBusinesses = await prisma.userBusiness.findMany({ where: { userId } });
            const buffer = await generatePortfolioCanvas(interaction.user, myBusinesses);
            const attachment = new AttachmentBuilder(buffer, { name: 'portfolio.png' });

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`emp_action_market_${userId}`).setLabel('🛒 Mercado Oficial').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId(`emp_action_collect_${userId}`).setLabel('💵 Coletar Lucros Diários').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`emp_action_sell_${userId}`).setLabel('🏷️ Anunciar Negócio').setStyle(ButtonStyle.Secondary)
            );
            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`emp_action_blackmarket_${userId}`).setLabel('🏴‍☠️ Mercado Negro (Comprar de Jogadores)').setStyle(ButtonStyle.Danger)
            );

            return interaction.update({ content: null, files: [attachment], components: [row1, row2] });
        }

        // 1. ABRIR MERCADO OFICIAL
        if (action === 'market') {
            const allOwned = await prisma.userBusiness.findMany();
            const ownedIds = allOwned.map(b => b.businessId);

            const buffer = await generateMarketCanvas(ownedIds);
            const attachment = new AttachmentBuilder(buffer, { name: 'market.png' });

            const availableOptions = Object.keys(businesses)
                .filter(k => !ownedIds.includes(k))
                .map(k => ({
                    label: businesses[k].name, value: k, description: `Preço: $${businesses[k].price.toLocaleString()}`
                }));

            const components = [];
            if (availableOptions.length > 0) {
                const menu = new StringSelectMenuBuilder().setCustomId(`emp_action_buy_${userId}`).setPlaceholder('Selecione a empresa para comprar...').addOptions(availableOptions);
                components.push(new ActionRowBuilder().addComponents(menu));
            }
            components.push(btnBack);

            return interaction.update({ content: availableOptions.length === 0 ? '⚠️ **Todas as empresas já têm dono!**' : '', files: [attachment], components: components });
        }

        // 2. COMPRA OFICIAL
        if (action === 'buy') {
            const businessId = interaction.values[0];
            const biz = businesses[businessId];

            const alreadyOwned = await prisma.userBusiness.findFirst({ where: { businessId } });
            if (alreadyOwned) return interaction.reply({ content: '❌ Outra pessoa acabou de comprar essa empresa!', ephemeral: true });
            if (userDb.balance < biz.price) return interaction.reply({ content: '❌ Você não tem grana na carteira!', ephemeral: true });

            await prisma.$transaction([
                prisma.user.update({ where: { userId }, data: { balance: { decrement: biz.price } } }),
                prisma.userBusiness.create({ data: { userId, businessId } })
            ]);

            return interaction.update({ content: `# 🏢 CONTRATO ASSINADO\nVocê comprou a exclusividade da **${biz.name}**!\n🚨 Não esqueça de coletar a cada 24h para não falir!`, files: [], components: [btnBack] });
        }

        // 3. COLETAR E FALÊNCIAS
        if (action === 'collect') {
            const myBiz = await prisma.userBusiness.findMany({ where: { userId } });
            if (myBiz.length === 0) return interaction.reply({ content: 'Você não tem negócios.', ephemeral: true });

            let totalRev = 0, totalMaint = 0, faliuCount = 0, collectedCount = 0;
            let falidasNames = [];

            for (const b of myBiz) {
                const config = businesses[b.businessId];
                const horas = (Date.now() - new Date(b.lastCollected)) / 3600000;

                if (horas >= 48) {
                    await prisma.userBusiness.delete({ where: { id: b.id } });
                    faliuCount++; falidasNames.push(config.name);
                } else if (horas >= 24) {
                    totalRev += config.revenue; totalMaint += config.maintenance; collectedCount++;
                    await prisma.userBusiness.update({ where: { id: b.id }, data: { lastCollected: new Date() } });
                }
            }

            const netProfit = totalRev - totalMaint;
            if (netProfit !== 0) {
                await prisma.user.update({ where: { userId }, data: { balance: { increment: netProfit } } });
            }

            let resposta = `# 📊 BALANÇO DIÁRIO\n`;
            if (collectedCount > 0) resposta += `✅ **Coletado:** ${collectedCount} empresas\n💵 **Receita:** +$${totalRev.toLocaleString()}\n📉 **Manutenção:** -$${totalMaint.toLocaleString()}\n💰 **Líquido Depositado:** **$${netProfit.toLocaleString()}**\n\n`;
            if (faliuCount > 0) resposta += `☠️ **ALERTA DE FALÊNCIA!**\nAs empresas: ${falidasNames.join(', ')} **FALIRAM** por mais de 48h sem gestão!\n*Elas voltaram para o mercado livre.*\n`;
            if (collectedCount === 0 && faliuCount === 0) resposta = `Nenhuma empresa pronta para coleta (Aguarde 24h).`;

            return interaction.update({ content: resposta, files: [], components: [btnBack] });
        }

        // 4. ANUNCIAR (Botão inicial abre menu)
        if (action === 'sell') {
            const myBiz = await prisma.userBusiness.findMany({ where: { userId } });
            if (myBiz.length === 0) return interaction.reply({ content: 'Você não tem negócios.', ephemeral: true });

            const menu = new StringSelectMenuBuilder().setCustomId(`emp_action_sellexec_${userId}`).setPlaceholder('Escolha qual negócio quer anunciar...').addOptions(
                myBiz.map(b => ({ label: businesses[b.businessId].name, value: b.id, description: b.forSalePrice ? `Já anunciado por $${b.forSalePrice.toLocaleString()}` : 'Não está à venda' }))
            );

            return interaction.update({ content: '🏷️ **Anunciar Empresa**\nSelecione a empresa que deseja vender. Você poderá escolher o preço na próxima etapa.', files: [], components: [new ActionRowBuilder().addComponents(menu), btnBack] });
        }

        // 4.1 MOSTRAR MODAL DE PREÇO
        if (action === 'sellexec') {
            const instanceId = interaction.values[0];
            const modal = new ModalBuilder().setCustomId(`emp_action_modalsell_${instanceId}`).setTitle('Definir Preço de Venda');
            const priceInput = new TextInputBuilder().setCustomId('price').setLabel('Preço (ex: 5000000, 5m)').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(priceInput));
            return interaction.showModal(modal); // Envia o Pop-up para o usuário digitar
        }

        // 4.2 PROCESSAR MODAL DE PREÇO
        if (action.startsWith('modalsell')) {
            const instanceId = parts[3]; // A id da empresa no banco
            const rawPrice = interaction.fields.getTextInputValue('price');
            const price = parseAmount(rawPrice);

            if (price <= 0 || isNaN(price)) return interaction.reply({ content: '❌ Preço inválido!', ephemeral: true });

            await prisma.userBusiness.update({ where: { id: instanceId }, data: { forSalePrice: price } });
            return interaction.reply({ content: `✅ **Sucesso!** A empresa foi anunciada no Mercado Negro por **$${price.toLocaleString()}**!`, ephemeral: true });
        }

        // 5. MERCADO NEGRO (VER ANÚNCIOS DOS OUTROS)
        if (action === 'blackmarket') {
            // Busca negócios à venda que NÃO são do usuário atual
            const forSale = await prisma.userBusiness.findMany({ 
                where: { forSalePrice: { not: null }, userId: { not: userId } },
                include: { user: true }
            });

            if (forSale.length === 0) return interaction.update({ content: '🏴‍☠️ O Mercado Negro está vazio. Ninguém está vendendo nada no momento.', files: [], components: [btnBack] });

            const menu = new StringSelectMenuBuilder().setCustomId(`emp_action_buyplayer_${userId}`).setPlaceholder('Comprar empresa de um jogador...').addOptions(
                forSale.map(b => ({
                    label: businesses[b.businessId].name,
                    value: b.id,
                    description: `Vendedor: ${b.userId} | Preço: $${b.forSalePrice.toLocaleString()}`
                }))
            );

            return interaction.update({ content: '# 🏴‍☠️ MERCADO CLANDESTINO\nAqui os jogadores vendem seus negócios. A transferência é instantânea e o bot garante o pagamento.', files: [], components: [new ActionRowBuilder().addComponents(menu), btnBack] });
        }

        // 6. COMPRAR DE UM JOGADOR
        if (action === 'buyplayer') {
            const instanceId = interaction.values[0];
            const bizInstance = await prisma.userBusiness.findUnique({ where: { id: instanceId } });

            if (!bizInstance || !bizInstance.forSalePrice) return interaction.reply({ content: '❌ Este anúncio não existe mais.', ephemeral: true });
            if (userDb.balance < bizInstance.forSalePrice) return interaction.reply({ content: `❌ Você precisa de **$${bizInstance.forSalePrice.toLocaleString()}** para comprar!`, ephemeral: true });

            const price = bizInstance.forSalePrice;
            const sellerId = bizInstance.userId;
            const businessName = businesses[bizInstance.businessId].name;

            // Transação segura: Tira do comprador, dá pro vendedor, troca o dono, reseta o tempo de coleta e tira da venda.
            await prisma.$transaction([
                prisma.user.update({ where: { userId }, data: { balance: { decrement: price } } }),
                prisma.user.update({ where: { userId: sellerId }, data: { balance: { increment: price } } }),
                prisma.userBusiness.update({ 
                    where: { id: instanceId }, 
                    data: { userId: userId, forSalePrice: null, lastCollected: new Date() } 
                })
            ]);

            return interaction.update({ content: `# 🤝 NEGÓCIO FECHADO NO SUBMUNDO\nVocê comprou a **${businessName}** por **$${price.toLocaleString()}**.\nA grana já foi enviada para o antigo dono. Lembre-se de coletar os lucros em 24h!`, components: [btnBack] });
        }
    }
};