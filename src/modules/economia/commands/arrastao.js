import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { getFactionOfUser } from '../../../utils/factionService.js';
import { getActiveBuffEffects, hasActiveCooldown } from '../../../utils/buffService.js';

// 👑 SEU ID AQUI (o dono do morro não pega cooldown)
const DEV_ID = '1070658145740926987';
// Tempo que a PM tem pra tentar interceptar
const TEMPO = 60000;
const TIPO = 'arrastao';

export default {
    name: 'arrastao',
    execute: async (message) => {
        const userId = message.author.id;
        const guildId = message.guild.id;

        const faction = await getFactionOfUser(userId, guildId);
        if (!faction) {
            return message.reply('❌ Você não é de nenhuma facção! Dá um `k fac` pra saber como entrar no jogo.');
        }

        if (await hasActiveCooldown(userId, 'ferido')) {
            return message.reply('🤕 Tá todo moído! Nem gritar "ISSO É UM ARRASTÃO!" consegue. Procura um **Médico** (`k tratar @medico`).');
        }

        const userDb = await prisma.user.upsert({ where: { userId }, update: {}, create: { userId } });
        const skills = typeof userDb.skills === 'string' ? JSON.parse(userDb.skills) : (userDb.skills || {});
        const sorteLvl = skills.sorte || 1;
        const agilidadeLvl = skills.agilidade || 1;
        const intimidacaoLvl = skills.intimidacao || 1;
        const forcaLvl = skills.forca || 1;

        // Cooldown 20 min (15 min VIP); Agilidade -4%/nv
        const isDev = userId === DEV_ID;
        const isVip = userDb.isPremium;
        const cooldownMinutes = Math.max(1, Math.round((isVip ? 15 : 20) * (1 - agilidadeLvl * 0.04)));

        if (!isDev) {
            const cd = await prisma.cooldown.findUnique({
                where: { userId_command: { userId, command: 'arrastao' } }
            });
            if (cd && cd.expiresAt > new Date()) {
                const minutos = Math.ceil((cd.expiresAt - new Date()) / 60000);
                return message.reply(`🕶️ A praça ainda tá lembrando do seu arrastão! Esquenta a cabeça em **${minutos} minutos**.`);
            }
            const nextTime = new Date(Date.now() + cooldownMinutes * 60 * 1000);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId, command: 'arrastao' } },
                update: { expiresAt: nextTime },
                create: { userId, command: 'arrastao', expiresAt: nextTime }
            });
        }

        // Lucro base 18k-30k, escalado por Sorte e Força
        let lucro = Math.floor(Math.random() * (30000 - 18000 + 1)) + 18000;
        lucro = Math.floor(lucro * (1 + sorteLvl * 0.05));
        lucro = Math.floor(lucro * (1 + forcaLvl * 0.05));

        // Buffs de facção e de item
        const buffEffects = await getActiveBuffEffects(userId);
        if (faction.ramo === 'trafico') lucro = Math.floor(lucro * 1.05); // 💊 Tráfico: +5% no saque

        // Chance de sucesso: base 50% + Intimidação + arma/buff + ramo Armas
        const bonusIntimidacao = intimidacaoLvl * 0.02;
        let successThreshold = 0.5 + bonusIntimidacao + buffEffects.sucesso;
        let msgFac = '';
        if (buffEffects.sucesso > 0) {
            msgFac += `\n*🔫 Sua arma ilegal garantiu +${(buffEffects.sucesso * 100).toFixed(0)}% de chance de sucesso!*`;
        }
        if (faction.ramo === 'armas') {
            const bonusArma = Math.min(0.15, faction.nivel * 0.03);
            successThreshold += bonusArma;
            msgFac += `\n*🔫 Sua facção **${faction.name}** te garantiu +${(bonusArma * 100).toFixed(0)}% de chance de sucesso!*`;
        }

        const chance = Math.random() * 100;

        // 💥 FALHA: a multidão revidou e a viatura chegou
        if (chance > successThreshold * 100) {
            const multa = Math.floor(lucro / 2);
            await prisma.user.update({
                where: { userId },
                data: { balance: { decrement: Math.min(multa, userDb.balance) } }
            });

            let feridoMsg = '';
            if (Math.random() < 0.2) {
                await prisma.cooldown.upsert({
                    where: { userId_command: { userId, command: 'ferido' } },
                    update: { expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
                    create: { userId, command: 'ferido', expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
                });
                feridoMsg = '\n🤕 **O vendedor de pipoca te acertou com o guarda-chuva na fuga.** Tá ferido por 15 minutos!';
            }

            return message.reply(`🚨 **O ARRASTÃO VIROU CONFUSÃO!**\nA galera da praça reagiu e a viatura fechou o cerco. Você vazou com **$${multa.toLocaleString('pt-BR')}** de prejuízo.\n*A polícia tá revistando a área...*${feridoMsg}`);
        }

        // ✅ SUCESSO: arrastão rendeu
        // 🧼 90% do saque é grana suja (muito quente)
        const limpo = Math.floor(lucro * 0.1);
        const sujo = lucro - limpo;

        await prisma.user.update({
            where: { userId },
            data: { balance: { increment: limpo }, dirtyMoney: { increment: sujo } }
        });

        const embedRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crime_intercept').setLabel('🚨 INTERCEPTAR!').setStyle(ButtonStyle.Danger)
        );

        const alertMsg = await message.channel.send({
            content: `📢 **COMUNICADO DA RÁDIO DA PM:**\n\n🚨 *"ALÔ TODAS AS VIATURAS! ARRASTÃO NA PRAÇA CENTRAL! O <@${userId}> levantou a multidão e saiu correndo com um monte de pertences! Cerquem a região e bora pra cima!"*\n\n*O meliante tá **${TEMPO / 1000} segundos** tentando sumir. Quem é Oficial da PM pode interceptar!*`,
            components: [embedRow]
        });

        // Registra o alerta pra o componente crime_intercept resolver (sem conflito de collector)
        global.activeCrimes = global.activeCrimes || new Map();
        global.activeCrimes.set(alertMsg.id, { criminalId: userId, guildId, tipo: TIPO });

        // Limpeza: se nenhum PM responder em 60s, o meliante some
        setTimeout(() => {
            global.activeCrimes?.delete(alertMsg.id);
            alertMsg.edit({
                content: `💨 **FIM DO PROTOCOLO!**\n\nNenhum Oficial respondeu ao chamado e o <@${userId}> conseguiu sumir no meio do povo com o butim do arrastão.\n\n*A ROTA foi tomar café.*`,
                components: []
            }).catch(() => {});
        }, TEMPO);

        return message.reply(`🕶️ **ARRASTÃO NO MAIOR ESTILO!**\n\nVocê passou na praça central e a multidão ficou de cueca! O butim total: **$${lucro.toLocaleString('pt-BR')}**!\n\n> 💵 **Limpo:** $${limpo.toLocaleString('pt-BR')} na conta\n> 🧼 **Sujo:** $${sujo.toLocaleString('pt-BR')} — lava isso com \`k lavar\` antes de gastar!\n\n*Mete o pé, chefe! Metade da cidade te viu...*${msgFac}`);
    }
};
