import { prisma } from '../../../core/database.js';

// 🛒 Catálogo do Mercado Negro (Itens ilegais que não estão na loja normal)
const mercadoNegro = {
    'c4': { name: 'c4', price: 150000, displayName: 'C4 Militar', type: 'ilegal' }
};

export default {
    name: 'comprar',
    execute: async (message, args) => {
        const inputName = args.join(' ');
        const itemKey = inputName.toLowerCase();

        if (!inputName) {
            return message.reply('🛒 Tá moscando no balcão? Fala logo o que você quer comprar! Ex: `k comprar c4`');
        }

        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (!user) return message.reply('❌ Você não tem registro na cidade.');

        let itemPrice = 0;
        let itemIdToSave = '';
        let itemDisplayName = '';
        let isIlegal = false;

        // 1. Verifica se é um item do Mercado Negro (ex: C4)
        if (mercadoNegro[itemKey]) {
            const itemIlegal = mercadoNegro[itemKey];
            itemPrice = itemIlegal.price;
            itemIdToSave = itemIlegal.name;
            itemDisplayName = itemIlegal.displayName;
            isIlegal = true;
        } 
        // 2. Se não for do tráfico, procura na Loja Oficial (Banco de Dados)
        else {
            const itemLoja = await prisma.shopItem.findUnique({ where: { name: inputName } });

            if (!itemLoja) {
                return message.reply('❌ Essa mercadoria não existe nem na loja e nem no beco, chefe. Confere o nome no `k loja` ou `k mercadonegro`.');
            }

            itemPrice = itemLoja.price;
            itemIdToSave = itemLoja.name;
            itemDisplayName = itemLoja.name;
        }

        // Verifica se o magnata tem o malote pra pagar
        if (user.balance < itemPrice) {
            return message.reply(`💸 **Faltou grana!** A parada custa **$${itemPrice.toLocaleString('pt-BR')}**, e você só tem **$${user.balance.toLocaleString('pt-BR')}**.`);
        }

        // Transação: Desconta dinheiro e adiciona ao inventário usando a sua estrutura original
        await prisma.$transaction([
            prisma.user.update({ 
                where: { userId: message.author.id }, 
                data: { balance: { decrement: itemPrice } } 
            }),
            prisma.inventory.create({ 
                data: { userId: message.author.id, itemId: itemIdToSave } 
            })
        ]);

        // Respostas personalizadas dependendo de onde ele comprou
        if (isIlegal) {
            return message.reply(`🧨 **MERCADORIA ILEGAL ENTREGUE!**\n\nVocê passou **$${itemPrice.toLocaleString('pt-BR')}** numa maleta no beco escuro e o traficante te entregou a **${itemDisplayName}**.\nEsconde isso na jaqueta e vai lá explodir o \`k carroforte\`!`);
        } else {
            return message.reply(`🛒 **COMPRA FECHADA!**\n\nVocê largou **$${itemPrice.toLocaleString('pt-BR')}** no balcão e levou **${itemDisplayName}** pra casa com sucesso!`);
        }
    }
};