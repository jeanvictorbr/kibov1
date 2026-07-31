import { prisma } from '../../../core/database.js';
import { FACTIONS } from '../../../utils/factionConfig.js';
import { getFactionOfUser, addFactionXp, levelBonus, addToEstoque } from '../../../utils/factionService.js';
import { FACTION_ITEMS, rollProduction } from '../../../utils/factionItems.js';
import { getActiveBuffEffects, hasActiveCooldown } from '../../../utils/buffService.js';

// 👑 SEU ID AQUI (o dono do morro não pega cooldown)
const DEV_ID = '1070658145740926987';

export default {
    name: 'operacao',
    execute: async (message) => {
        const userId = message.author.id;
        const guildId = message.guild.id;

        const faction = await getFactionOfUser(userId, guildId);
        if (!faction) {
            return message.reply('❌ Você não é de nenhuma facção! Dá um `k fac` pra saber como entrar no jogo.');
        }

        const config = FACTIONS[faction.ramo];
        const userDb = await prisma.user.upsert({
            where: { userId },
            update: {},
            create: { userId }
        });

        // --- SKILLS ---
        const skills = typeof userDb.skills === 'string' ? JSON.parse(userDb.skills) : (userDb.skills || {});
        const sorteLvl = skills.sorte || 1;
        const agilidadeLvl = skills.agilidade || 1;
        const inteligenciaLvl = skills.inteligencia || 1;

        // --- COOLDOWN (base 10 min / 5 min VIP; Agilidade -4%/nv; ramo Hack -15%) ---
        const isDev = userId === DEV_ID;
        const isVip = userDb.isPremium;
        let cooldownMinutes = (isVip ? 5 : 10) * (1 - agilidadeLvl * 0.04);
        if (faction.ramo === 'hack') cooldownMinutes *= 0.85;
        cooldownMinutes = Math.max(1, Math.round(cooldownMinutes));

        if (!isDev) {
            const cd = await prisma.cooldown.findUnique({ where: { userId_command: { userId, command: 'operacao' } } });
            if (cd && cd.expiresAt > new Date()) {
                const minutos = Math.ceil((cd.expiresAt - new Date()) / 60000);
                return message.reply(`⏳ Operação em curso! A polícia tá na cola. Esconde por mais **${minutos} minutos**.`);
            }
            const nextTime = new Date(Date.now() + cooldownMinutes * 60 * 1000);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId, command: 'operacao' } },
                update: { expiresAt: nextTime },
                create: { userId, command: 'operacao', expiresAt: nextTime }
            });
        }

        // --- RESULTADO DA OPERAÇÃO ---
        if (await hasActiveCooldown(userId, 'ferido')) {
            return message.reply('🤕 Você tá **ferido**! Caiu no confronto e não consegue operar. Procura um **Médico** (`k tratar @medico`) ou espera o bandido da receita!');
        }

        const chance = Math.random() * 100;
        let risco = config.risco;
        if (faction.ramo === 'armas') risco = Math.floor(risco * 0.7); // 🔫 Buff: -30% de risco

        let lucro = Math.floor(Math.random() * (config.opMax - config.opMin + 1)) + config.opMin;
        lucro = Math.floor(lucro * (1 + sorteLvl * 0.05)); // 🍀 Sorte
        if (faction.ramo === 'hack') lucro = Math.floor(lucro * (1 + inteligenciaLvl * 0.07)); // 🧠 Hacker usa Inteligência
        lucro = Math.floor(lucro * (1 + levelBonus(faction.nivel))); // 🍀 Buff de nível da facção
        if (faction.ramo === 'trafico') lucro = Math.floor(lucro * 1.10); // 💊 Buff: +10% de lucro
        const buffEffects = await getActiveBuffEffects(userId);
        if (buffEffects.lucro > 0) lucro = Math.floor(lucro * (1 + buffEffects.lucro)); // 🌿💉 Droga turbina

        // --- FALHA ---
        if (chance < risco) {
            const multa = Math.floor(lucro / 2);
            await prisma.user.update({
                where: { userId },
                data: { balance: { decrement: Math.min(multa, userDb.balance) } }
            });

            let feridoMsg = '';
            if (Math.random() < 0.25) {
                // 🤕 25% de chance de se machucar na fuga
                await prisma.cooldown.upsert({
                    where: { userId_command: { userId, command: 'ferido' } },
                    update: { expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
                    create: { userId, command: 'ferido', expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
                });
                feridoMsg = '\n🤕 **Você se machucou na fuga!** Tá ferido por 15 minutos. Procura um **Médico** (`k tratar @medico`) ou fica de molho!';
            }

            return message.reply(`💥 **OPERAÇÃO DEU RUIM!**\nA polícia caiu de surpresa e você perdeu **$${multa.toLocaleString('pt-BR')}** tentando apagar os rastros. O chefe não gostou nada disso.${feridoMsg}`);
        }

        // --- SUCESSO (60% pro bolso, 40% pro caixa) ---
        const pessoal = Math.floor(lucro * 0.6);
        let proCaixa = Math.floor(lucro * 0.4);
        if (faction.ramo === 'lavagem') proCaixa = Math.floor(lucro * 0.55); // 💵 Buff: mais pro caixa

        let xpGanho = 15;
        if (faction.ramo === 'transporte') xpGanho = 30; // 🚚 Buff: 2x XP
        if (buffEffects.hackXp) xpGanho = Math.floor(xpGanho * 1.5); // 🕹️ Script de Invasão: +50% XP

        let influencia = 1;
        if (buffEffects.transporte) influencia = 3; // 🗺️ Mapa de Rotas: +2 de influência

        // 🧼 40% do corte pessoal é grana suja
        const pessoalLimpo = Math.floor(pessoal * 0.6);
        const pessoalSujo = pessoal - pessoalLimpo;

        await prisma.$transaction([
            prisma.user.update({ where: { userId }, data: { balance: { increment: pessoalLimpo }, dirtyMoney: { increment: pessoalSujo } } }),
            prisma.faction.update({
                where: { id: faction.id },
                data: { bank: { increment: proCaixa }, influencia: { increment: influencia } }
            })
        ]);
        await addFactionXp(faction.id, xpGanho);

        // 📦 Toda operação produz a mercadoria exclusiva do ramo
        let msgItem = '';
        const itemKey = rollProduction(faction.ramo, faction.nivel);
        if (itemKey) {
            await addToEstoque(faction.id, itemKey, 1);
            const item = FACTION_ITEMS[itemKey];
            msgItem = `\n> 📦 **Mercadoria produzida:** ${item.emoji} **${item.name}** +1 no estoque!`;
        }

        const factionUpdated = await prisma.faction.findUnique({ where: { id: faction.id } });

        return message.reply(`✅ **OPERAÇÃO CONCLUÍDA!**\n\n${config.emoji} Você executou uma operação de **${config.name}** e rendeu **$${lucro.toLocaleString('pt-BR')}**!\n\n> 🧍 Seu corte: **$${pessoal.toLocaleString('pt-BR')}** ($${pessoalLimpo.toLocaleString('pt-BR')} limpo + $${pessoalSujo.toLocaleString('pt-BR')} sujo)\n> 🏴 Pro caixa da fac: **$${proCaixa.toLocaleString('pt-BR')}**\n> 📊 XP da facção: **+${xpGanho}** (Nv. **${factionUpdated.nivel}**)\n> 🏴 Influência: **+${influencia}**${msgItem}`);
    }
};
