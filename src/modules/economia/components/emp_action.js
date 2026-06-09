import { AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { businesses } from '../../../utils/businessConfig.js';
import { generateMarketCanvas } from '../../../utils/canvasEmpresas.js';

export default {
    customId: 'emp_action', 
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const action = parts[2]; // market, collect, sell, buy
        const ownerId = parts[3]; 

        if (interaction.user.id !== ownerId) return interaction.reply({ content: 'Esse painel não é seu, chefe.', ephemeral: true });

        const userId = interaction.user.id;
        const userDb = await prisma.user.findUnique({ where: { userId } });

        // 1. ABRIR MERCADO PARA COMPRA
        if (action === 'market') {
            // Busca QUAIS empresas já têm dono
            const allOwned = await prisma.userBusiness.findMany();
            const ownedIds = allOwned.map(b => b.businessId);

            const buffer = await generateMarketCanvas(ownedIds);
            const attachment = new AttachmentBuilder(buffer, { name: 'market.png' });

            // Só mostra no select menu as que NÃO têm dono (Exclusividade)
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
                    .setCustomId(`emp_action_buy_${userId}`)
                    .setPlaceholder('Selecione a empresa para comprar...')
                    .addOptions(availableOptions);
                components.push(new ActionRowBuilder().addComponents(menu));
            }

            await interaction.update({ 
                content: availableOptions.length === 0 ? '⚠️ **Todas as empresas já têm dono!** Fique de olho, alguma pode falir a qualquer momento e voltar ao mercado.' : '',
                files: [attachment], 
                components: components 
            });
            return;
        }

        // 2. PROCESSAR COMPRA
        if (action === 'buy') {
            const businessId = interaction.values[0];
            const biz = businesses[businessId];

            // Trava de segurança: Checa se alguém já comprou milissegundos antes
            const alreadyOwned = await prisma.userBusiness.findFirst({ where: { businessId } });
            if (alreadyOwned) return interaction.reply({ content: '❌ Outra pessoa acabou de comprar essa empresa, chefe! Fique mais rápido da próxima vez.', ephemeral: true });

            if (userDb.balance < biz.price) return interaction.reply({ content: '❌ Você não tem grana na carteira para esse investimento!', ephemeral: true });

            await prisma.$transaction([
                prisma.user.update({ where: { userId }, data: { balance: { decrement: biz.price } } }),
                prisma.userBusiness.create({ data: { userId, businessId } })
            ]);

            return interaction.update({ content: `# 🏢 CONTRATO ASSINADO\nVocê acaba de comprar a exclusividade da **${biz.name}**!\n\n🚨 **LEIA COM ATENÇÃO:**\nVocê **PRECISA** usar \`k empresas\` e coletar os lucros a cada 24h. Se passar de **48 horas sem coletar**, a empresa **FALE**, você perde tudo o que investiu, e ela **volta automaticamente pro mercado** para qualquer um comprar!`, files: [], components: [] });
        }

        // 3. COLETAR LUCROS (E DELETAR FALIDOS)
        if (action === 'collect') {
            const myBiz = await prisma.userBusiness.findMany({ where: { userId } });
            if (myBiz.length === 0) return interaction.reply({ content: 'Você não tem negócios para coletar.', ephemeral: true });

            let totalRev = 0, totalMaint = 0, faliuCount = 0, collectedCount = 0;
            let falidasNames = [];

            for (const b of myBiz) {
                const config = businesses[b.businessId];
                const horas = (Date.now() - new Date(b.lastCollected)) / 3600000;

                if (horas >= 48) {
                    // FALIU! Mais de 48h sem pagar funcionário. DELETA do banco!
                    await prisma.userBusiness.delete({ where: { id: b.id } });
                    faliuCount++;
                    falidasNames.push(config.name);
                } else if (horas >= 24) {
                    // COLETOU COM SUCESSO
                    totalRev += config.revenue;
                    totalMaint += config.maintenance;
                    collectedCount++;
                    await prisma.userBusiness.update({ where: { id: b.id }, data: { lastCollected: new Date() } });
                }
            }

            const netProfit = totalRev - totalMaint;
            if (netProfit > 0) {
                await prisma.user.update({ where: { userId }, data: { balance: { increment: netProfit } } });
            } else if (netProfit < 0) {
                await prisma.user.update({ where: { userId }, data: { balance: { decrement: Math.abs(netProfit) } } });
            }

            let resposta = `# 📊 BALANÇO DIÁRIO\n`;
            if (collectedCount > 0) resposta += `✅ **Empresas operadas:** ${collectedCount}\n💵 **Receita:** +$${totalRev.toLocaleString()}\n📉 **Manutenção:** -$${totalMaint.toLocaleString()}\n💰 **Lucro Líquido Depositado:** **$${netProfit.toLocaleString()}**\n\n`;
            if (faliuCount > 0) resposta += `☠️ **ALERTA DE FALÊNCIA!**\nAs seguintes empresas ficaram mais de 48h sem gestão e **FALIRAM**:\n${falidasNames.map(n => `- ${n}`).join('\n')}\n*O contrato foi quebrado e elas já voltaram para o Mercado Imobiliário para compra!*\n`;
            if (collectedCount === 0 && faliuCount === 0) resposta = `Nenhuma empresa pronta para coleta. Aguarde completar 24 horas do último recolhimento.`;

            return interaction.update({ content: resposta, files: [], components: [] });
        }

        // 4. VENDER AO MERCADO NEGRO (Recupera 50% e devolve à loja)
        if (action === 'sell') {
            if (interaction.isButton()) {
                const myBiz = await prisma.userBusiness.findMany({ where: { userId } });
                if (myBiz.length === 0) return interaction.reply({ content: 'Você não tem nada para vender.', ephemeral: true });

                const menu = new StringSelectMenuBuilder()
                    .setCustomId(`emp_action_sellexec_${userId}`)
                    .setPlaceholder('Escolha o negócio para liquidar por 50% do valor...')
                    .addOptions(myBiz.map(b => ({
                        label: businesses[b.businessId].name,
                        value: b.id,
                        description: `Venda rápida por $${(businesses[b.businessId].price * 0.5).toLocaleString()}`
                    })));

                return interaction.update({ content: '☠️ O Mercado Clandestino compra na hora, mas paga apenas **50%** do valor original.\n**Atenção:** Ao vender, você perde a exclusividade e a empresa **voltará para a loja** para que outros jogadores possam comprá-la. Escolha:', files: [], components: [new ActionRowBuilder().addComponents(menu)] });
            } 
            
            if (interaction.customId.includes('sellexec')) {
                const instanceId = interaction.values[0];
                const bInstance = await prisma.userBusiness.findUnique({ where: { id: instanceId } });
                if (!bInstance) return interaction.reply({ content: 'Empresa não encontrada.', ephemeral: true });

                const config = businesses[bInstance.businessId];
                const sellValue = Math.floor(config.price * 0.5);

                await prisma.$transaction([
                    prisma.userBusiness.delete({ where: { id: instanceId } }),
                    prisma.user.update({ where: { userId }, data: { balance: { increment: sellValue } } })
                ]);

                return interaction.update({ content: `# 🤝 NEGÓCIO FECHADO\nVocê liquidou a empresa **${config.name}** e embolsou **$${sellValue.toLocaleString()}**.\nA empresa agora está **livre no mercado imobiliário** para quem chegar primeiro!`, components: [] });
            }
        }
    }
};