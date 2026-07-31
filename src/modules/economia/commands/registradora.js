import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { getFactionOfUser } from '../../../utils/factionService.js';
import { getActiveBuffEffects, hasActiveCooldown } from '../../../utils/buffService.js';

// 👑 SEU ID AQUI (o dono do morro não pega cooldown)
const DEV_ID = '1070658145740926987';
// Tempo que a PM tem pra tentar interceptar
const TEMPO = 60000;
const TIPO = 'registradora';

export default {
    name: 'registradora',
    execute: async (message) => {
        const userId = message.author.id;
        const guildId = message.guild.id;

        const faction = await getFactionOfUser(userId, guildId);
        if (!faction) {
            return message.reply('❌ Você não é de nenhuma facção! Dá um `k fac` pra saber como entrar no jogo.');
        }

        if (await hasActiveCooldown(userId, 'ferido')) {
            return message.reply('🤕 Tá todo moído! Nem segurar o pé de cabra consegue. Procura um **Médico** (`k tratar @medico`).');
        }

        const userDb = await prisma.user.upsert({ where: { userId }, update: {}, create: { userId } });
        const skills = typeof userDb.skills === 'string' ? JSON.parse(userDb.skills) : (userDb.skills || {});
        const sorteLvl = skills.sorte || 1;
        const agilidadeLvl = skills.agilidade || 1;
        const intimidacaoLvl = skills.intimidacao || 1;

        // Cooldown 15 min (10 min VIP); Agilidade -4%/nv
        const isDev = userId === DEV_ID;
        const isVip = userDb.isPremium;
        const cooldownMinutes = Math.max(1, Math.round((isVip ? 10 : 15) * (1 - agilidadeLvl * 0.04)));

        if (!isDev) {
            const cd = await prisma.cooldown.findUnique({
                where: { userId_command: { userId, command: 'registradora' } }
            });
            if (cd && cd.expiresAt > new Date()) {
                const minutos = Math.ceil((cd.expiresAt - new Date()) / 60000);
                return message.reply(`🏪 A loja da última estourada ainda tá no noticiário! Esquenta a cabeça em **${minutos} minutos**.`);
            }
            const nextTime = new Date(Date.now() + cooldownMinutes * 60 * 1000);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId, command: 'registradora' } },
                update: { expiresAt: nextTime },
                create: { userId, command: 'registradora', expiresAt: nextTime }
            });
        }

        // Lucro base 6k-12k, escalado por Sorte
        let lucro = Math.floor(Math.random() * (12000 - 6000 + 1)) + 6000;
        lucro = Math.floor(lucro * (1 + sorteLvl * 0.05));

        // Buffs de facção e de item
        const buffEffects = await getActiveBuffEffects(userId);
        if (faction.ramo === 'trafico') lucro = Math.floor(lucro * 1.05); // 💊 Tráfico: +5% no saque

        // Chance de sucesso: base 60% + Intimidação + arma/buff + ramo Armas
        const bonusIntimidacao = intimidacaoLvl * 0.02;
        let successThreshold = 0.6 + bonusIntimidacao + buffEffects.sucesso;
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

        // 💥 FALHA: o caixa trancou e a viatura chegou
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
                feridoMsg = '\n🤕 **Na correria você escorregou no sabão da limpeza e quebrou o braço.** Tá ferido por 15 minutos!';
            }

            return message.reply(`🚨 **A VITRINE QUEBROU MAS O CAIXA TRANCOU!**\nA sirene tocou na hora e você teve que vazar no prejuízo de **$${multa.toLocaleString('pt-BR')}**.\n*A polícia tá revistando a área...*${feridoMsg}`);
        }

        // ✅ SUCESSO: caixa estourado
        // 🧼 80% do saque é grana suja (muito quente)
        const limpo = Math.floor(lucro * 0.2);
        const sujo = lucro - limpo;

        await prisma.user.update({
            where: { userId },
            data: { balance: { increment: limpo }, dirtyMoney: { increment: sujo } }
        });

        const embedRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('crime_intercept').setLabel('🚨 INTERCEPTAR!').setStyle(ButtonStyle.Danger)
        );

        const alertMsg = await message.channel.send({
            content: `📢 **COMUNICADO DA RÁDIO DA PM:**\n\n🚨 *"Alô ROTA, alô ROTA! Registradora estourada na loja 24h da zona leste! O <@${userId}> meteu o pé com o dinheiro do caixa e tá sumindo na quebrada! Se algum Oficial estiver na área, vai pra cima!"*\n\n*O meliante tá **${TEMPO / 1000} segundos** tentando sumir. Quem é Oficial da PM pode interceptar!*`,
            components: [embedRow]
        });

        // Registra o alerta pra o componente crime_intercept resolver (sem conflito de collector)
        global.activeCrimes = global.activeCrimes || new Map();
        global.activeCrimes.set(alertMsg.id, { criminalId: userId, guildId, tipo: TIPO });

        // Limpeza: se nenhum PM responder em 60s, o meliante some
        setTimeout(() => {
            global.activeCrimes?.delete(alertMsg.id);
            alertMsg.edit({
                content: `💨 **FIM DO PROTOCOLO!**\n\nNenhum Oficial respondeu ao chamado e o <@${userId}> conseguiu sumir com a grana da registradora.\n\n*A ROTA foi tomar café.*`,
                components: []
            }).catch(() => {});
        }, TEMPO);

        return message.reply(`💰 **REGISTRADORA ESTOURADA!**\n\nO pé de cabra abriu o caixa da loja 24h como uma latinha! Você levou **$${lucro.toLocaleString('pt-BR')}**!\n\n> 💵 **Limpo:** $${limpo.toLocaleString('pt-BR')} na conta\n> 🧼 **Sujo:** $${sujo.toLocaleString('pt-BR')} — lava isso com \`k lavar\` antes de gastar!\n\n*Corre, chefe! A ROTA tá de olho na área...*${msgFac}`);
    }
};
