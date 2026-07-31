import { prisma } from '../../../core/database.js';
import { FACTION_ITEMS } from '../../../utils/factionItems.js';

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

        // 🔓 Classe "Tudo Liberado": vira VIP + recebe todos os itens exclusivos
        await prisma.user.upsert({
            where: { userId: target.id },
            update: { isPremium: true },
            create: { userId: target.id, isPremium: true }
        });

        const granted = [];
        for (const [key, item] of Object.entries(FACTION_ITEMS)) {
            const existing = await prisma.inventory.findFirst({
                where: { userId: target.id, itemId: item.name }
            });
            if (existing) {
                await prisma.inventory.update({ where: { id: existing.id }, data: { amount: qty } });
            } else {
                await prisma.inventory.create({ data: { userId: target.id, itemId: item.name, amount: qty } });
            }
            granted.push(`${item.emoji} **${item.name}** ×${qty}`);
        }

        return message.reply(`💎 **CLASSE "TUDO LIBERADO" ATIVADA!**\n\n🔓 <@${target.id}> agora é **VIP**!\n🎒 Recebeu os **${granted.length} itens exclusivos** de facção no inventário:\n${granted.map(g => `> ${g}`).join('\n')}\n\n*Ativa os buffs com \`k usar\`!*`);
    }
};
