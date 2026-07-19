import { prisma } from '../../../core/database.js';

export default {
    name: 'additem',
    execute: async (message, args) => {
        // Trava de segurança para o dono
        if (message.author.id !== process.env.DEVELOPER_ID) return;

        // 1. Extrai o nome (Primeira palavra) e o Preço (Segunda palavra convertida para número)
        const name = args[0];
        const price = parseInt(args[1]);
        
        // 2. Junta absolutamente tudo que vier depois do preço como descrição
        const description = args.slice(2).join(' ');

        // 3. Trava anti-crash: Avisa se você esquecer algo ou errar a ordem
        if (!name || isNaN(price) || !description) {
            return message.reply({
                content: '❌ **Erro de Sintaxe!**\nO formato correto é: `k additem <Nome> <Preço> <Descrição>`\n👉 **Exemplo:** `k additem Scanner 15000 📟 Rastreia quem tem dinheiro vivo na carteira.`'
            });
        }

        try {
            await prisma.shopItem.create({
                data: { name, price, description, type: 'UTILITY' }
            });

            message.reply(`✅ Item **${name}** adicionado à loja por **$${price.toLocaleString('pt-BR')}**!\n📝 *${description}*`);
        } catch (error) {
            console.error(error);
            message.reply('❌ Erro ao adicionar o item. Verifique se ele já não existe no banco de dados!');
        }
    }
};