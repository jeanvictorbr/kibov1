import { prisma } from '../../../core/database.js';
import { FACTION_ITEMS } from '../../../utils/factionItems.js';

const MERCADO_NEGRO = {
    'c4': 'C4 Militar'
};

export default {
    name: 'devgive',
    execute: async (message, args, client, reply, targetUser) => {
        // Trava de segurança para o dono
        if (message.author.id !== process.env.DEVELOPER_ID) return;

        const target = targetUser;
        if (!target) {
            return message.reply('❌ Marca o jogador que vai ganhar a classe! Ex: `k devgive @user` ou `k devgive @user 999`');
        }

        const numbers = args.filter(a => typeof a === 'number');
        const qty = Math.floor(numbers[0] || 99999);
        if (qty <= 0) {
            return message.reply('❌ Quantidade inválida!');
        }

        // 🔓 Classe "Tudo Liberado": vira VIP + recebe todos os itens do jogo
        await prisma.user.upsert({
            where: { userId: target.id },
            update: { isPremium: true },
            create: { userId: target.id, isPremium: true }
        });

        // 1. Itens exclusivos de facção
        const factionItems = Object.entries(FACTION_ITEMS).map(([key, item]) => ({
            name: item.name,
            label: `${item.emoji} **${item.name}**`
        }));

        // 2. Itens do Mercado Negro (hardcoded no `k comprar`)
        const illegalItems = Object.entries(MERCADO_NEGRO).map(([key, displayName]) => ({
            name: key,
            label: `🧨 **${displayName}**`
        }));

        // 3. Itens da Loja Oficial (dinâmicos, criados com `k additem`)
        const shopItems = (await prisma.shopItem.findMany()).map(i => ({
            name: i.name,
            label: `🛒 **${i.name}**`
        }));

        const allItems = [...factionItems, ...illegalItems, ...shopItems];

        // 4. Dá todos no inventário do alvo
        const granted = [];
        for (const item of allItems) {
            const existing = await prisma.inventory.findFirst({
                where: { userId: target.id, itemId: item.name }
            });
            if (existing) {
                await prisma.inventory.update({ where: { id: existing.id }, data: { amount: qty } });
            } else {
                await prisma.inventory.create({ data: { userId: target.id, itemId: item.name, amount: qty } });
            }
            granted.push(`${item.label} ×${qty}`);
        }

        const linhas = granted.join('\n> ');
        const resumo = linhas.length > 3800
            ? `${granted.slice(0, 8).join('\n> ')}\n> ...e mais ${granted.length - 8} itens da loja (confere com \`k usar\`)!`
            : linhas;

        return message.reply(`💎 **CLASSE "TUDO LIBERADO" ATIVADA!**\n\n🔓 <@${target.id}> agora é **VIP**!\n🎒 Recebeu **${granted.length} itens** (todos do jogo) no inventário:\n> ${resumo}\n\n*Ativa os buffs com \`k usar\`!*`);
    }
};
