import { prisma } from '../../../core/database.js';
import { FACTIONS } from '../../../utils/factionConfig.js';
import { getFactionOfUser, addFactionXp, levelBonus, addToEstoque } from '../../../utils/factionService.js';
import { FACTION_ITEMS, rollProduction } from '../../../utils/factionItems.js';
import { getActiveBuffEffects, hasActiveCooldown } from '../../../utils/buffService.js';

// 👑 SEU ID AQUI (o dono do morro não pega cooldown)
const DEV_ID = '1070658145740926987';
const RAMO = 'lavagem';

export default {
    name: 'caixinha',
    execute: async (message) => {
        const userId = message.author.id;
        const guildId = message.guild.id;

        const faction = await getFactionOfUser(userId, guildId);
        if (!faction) {
            return message.reply('❌ Você não é de nenhuma facção! Dá um `k fac` pra saber como entrar no jogo.');
        }
        if (faction.ramo !== RAMO) {
            return message.reply(`💵 Gerenciar caixinha é coisa da **Lavagem de Dinheiro**! Sua fac é de **${FACTIONS[faction.ramo].name}**.`);
        }

        if (await hasActiveCooldown(userId, 'ferido')) {
            return message.reply('🤕 Tá todo moído! Nem conferir o caixa sentado consegue. Procura um **Médico** (`k tratar @medico`).');
        }

        const userDb = await prisma.user.upsert({ where: { userId }, update: {}, create: { userId } });
        const skills = typeof userDb.skills === 'string' ? JSON.parse(userDb.skills) : (userDb.skills || {});
        const labiaLvl = skills.labia || 1;
        const agilidadeLvl = skills.agilidade || 1;

        // Cooldown 5 min (3 min VIP); Agilidade -4%/nv
        const isDev = userId === DEV_ID;
        const isVip = userDb.isPremium;
        const cooldownMinutes = Math.max(1, Math.round((isVip ? 3 : 5) * (1 - agilidadeLvl * 0.04)));

        if (!isDev) {
            const cd = await prisma.cooldown.findUnique({
                where: { userId_command: { userId, command: 'caixinha' } }
            });
            if (cd && cd.expiresAt > new Date()) {
                const minutos = Math.ceil((cd.expiresAt - new Date()) / 60000);
                return message.reply(`💰 A contabilidade ainda tá batendo o caixa da última leva! Volta em **${minutos} minutos**.`);
            }
            const nextTime = new Date(Date.now() + cooldownMinutes * 60 * 1000);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId, command: 'caixinha' } },
                update: { expiresAt: nextTime },
                create: { userId, command: 'caixinha', expiresAt: nextTime }
            });
        }

        // Lucro base 1.2k-3k, escalado por Lábia e nível da fac
        let lucro = Math.floor(Math.random() * (3000 - 1200 + 1)) + 1200;
        lucro = Math.floor(lucro * (1 + labiaLvl * 0.05));
        lucro = Math.floor(lucro * (1 + levelBonus(faction.nivel)));
        const buffEffects = await getActiveBuffEffects(userId);
        if (buffEffects.lucro > 0) lucro = Math.floor(lucro * (1 + buffEffects.lucro));

        const chance = Math.random() * 100;
        const risco = 15;

        // 💥 FALHA: a receita federal estourou a fachada
        if (chance < risco) {
            const multa = Math.floor(lucro / 2);
            await prisma.user.update({
                where: { userId },
                data: { balance: { decrement: Math.min(multa, userDb.balance) } }
            });

            let feridoMsg = '';
            if (Math.random() < 0.15) {
                await prisma.cooldown.upsert({
                    where: { userId_command: { userId, command: 'ferido' } },
                    update: { expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
                    create: { userId, command: 'ferido', expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
                });
                feridoMsg = '\n🤕 **No estresse, você tropeçou na escada do fundo com a mala na mão.** Tá ferido por 15 minutos!';
            }

            return message.reply(`🚔 **A RECEITA ESTOUROU A FACHADA!**\nVocê teve que engolir os papéis pra não ir junto. Prejuízo de **$${multa.toLocaleString('pt-BR')}** queimado na hora.${feridoMsg}`);
        }

        // ✅ SUCESSO: grana lavada no fluxo
        const pessoal = Math.floor(lucro * 0.55);
        let proCaixa = Math.floor(lucro * 0.45);
        const xpGanho = 5;

        // 💵 Buff do ramo: mais pra dentro do caixa da fac
        proCaixa = Math.floor(proCaixa * 1.15);

        const pessoalLimpo = Math.floor(pessoal * 0.6);
        const pessoalSujo = pessoal - pessoalLimpo;

        // 📦 Chance de produzir mercadoria pro estoque (30% + 2% por nível)
        const itemChance = Math.min(0.7, 0.3 + faction.nivel * 0.02);
        let msgItem = '';
        if (Math.random() < itemChance) {
            const itemKey = rollProduction(RAMO, faction.nivel);
            if (itemKey) {
                await addToEstoque(faction.id, itemKey, 1);
                const item = FACTION_ITEMS[itemKey];
                msgItem = `\n> 📦 **Mercadoria produzida:** ${item.emoji} **${item.name}** +1 no estoque!`;
            }
        }

        await prisma.$transaction([
            prisma.user.update({ where: { userId }, data: { balance: { increment: pessoalLimpo }, dirtyMoney: { increment: pessoalSujo } } }),
            prisma.faction.update({ where: { id: faction.id }, data: { bank: { increment: proCaixa }, influencia: { increment: 1 } } })
        ]);
        await addFactionXp(faction.id, xpGanho);

        return message.reply(`💵 **CAIXA GIRADO!**\n\nVocê fez a contabilidade girar nos comércios de fachada da **${faction.name}** e rendeu **$${lucro.toLocaleString('pt-BR')}**!\n\n> 🧍 Seu corte: **$${pessoal.toLocaleString('pt-BR')}** ($${pessoalLimpo.toLocaleString('pt-BR')} limpo + $${pessoalSujo.toLocaleString('pt-BR')} sujo)\n> 🏴 Pro caixa da fac: **$${proCaixa.toLocaleString('pt-BR')}** (+15% do ramo)\n> 📊 XP da facção: **+${xpGanho}** • 🏴 Influência: **+1**${msgItem}`);
    }
};
