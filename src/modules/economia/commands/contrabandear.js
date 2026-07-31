import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { getActiveBuffEffects, hasActiveCooldown } from '../../../utils/buffService.js';

// 👑 SEU ID AQUI (o dono do morro não pega cooldown)
const DEV_ID = '1070658145740926987';
// Tempo que a PM tem pra tentar interceptar
const TEMPO = 60000;

export default {
    name: 'contrabandear',
    execute: async (message) => {
        const userId = message.author.id;
        const guildId = message.guild.id;

        const userDb = await prisma.user.findUnique({ where: { userId } });
        if (userDb?.currentJob !== 'contrabandista') {
            return message.reply('📦 Só quem é **Contrabandista** conhece a rota do porto! Usa `k trabalhar`.');
        }

        if (await hasActiveCooldown(userId, 'ferido')) {
            return message.reply('🤕 Tá todo moído! Nem segurar a caixa de mercadoria consegue. Procura um **Médico** (`k tratar @medico`).');
        }

        const skills = typeof userDb.skills === 'string' ? JSON.parse(userDb.skills) : (userDb.skills || {});
        const sorteLvl = skills.sorte || 1;
        const agilidadeLvl = skills.agilidade || 1;
        const inteligenciaLvl = skills.inteligencia || 1;

        // Cooldown 15 min (5 min VIP); Agilidade -4%/nv
        const isDev = userId === DEV_ID;
        const isVip = userDb.isPremium;
        const cooldownMinutes = Math.max(1, Math.round((isVip ? 5 : 15) * (1 - agilidadeLvl * 0.04)));

        if (!isDev) {
            const cd = await prisma.cooldown.findUnique({
                where: { userId_command: { userId, command: 'contrabandear' } }
            });
            if (cd && cd.expiresAt > new Date()) {
                const minutos = Math.ceil((cd.expiresAt - new Date()) / 60000);
                return message.reply(`📦 A alfândega te reconheceu na última passagem! Espera **${minutos} minutos** pra tentar de novo.`);
            }
            await prisma.cooldown.upsert({
                where: { userId_command: { userId, command: 'contrabandear' } },
                update: { expiresAt: new Date(Date.now() + cooldownMinutes * 60 * 1000) },
                create: { userId, command: 'contrabandear', expiresAt: new Date(Date.now() + cooldownMinutes * 60 * 1000) }
            });
        }

        // Lucro base 8k-15k, escalado por Sorte; 🧠 Inteligência conhece a rota
        let lucro = Math.floor(Math.random() * (15000 - 8000 + 1)) + 8000;
        lucro = Math.floor(lucro * (1 + sorteLvl * 0.05));
        lucro = Math.floor(lucro * (1 + inteligenciaLvl * 0.07));

        // 🌿💉 Buff de droga turbina o lucro
        const buffEffects = await getActiveBuffEffects(userId);
        if (buffEffects.lucro > 0) lucro = Math.floor(lucro * (1 + buffEffects.lucro));

        const chance = Math.random() * 100;
        const risco = 35;

        // ==========================================
        // ✅ SUCESSO: mercadoria atravessou
        // ==========================================
        if (chance >= risco) {
            // 📦 Contrabando rende 70% de grana suja
            const limpo = Math.floor(lucro * 0.3);
            const sujo = lucro - limpo;

            await prisma.user.update({
                where: { userId },
                data: { balance: { increment: limpo }, dirtyMoney: { increment: sujo } }
            });

            return message.reply(`📦 **CONTRABANDO ATRAVESSOU!**\n\nA mercadoria passou pela fronteira sem a fiscal ver nada! O cliente pagou **$${lucro.toLocaleString('pt-BR')}** na entrega.\n\n> 💵 **Limpo:** $${limpo.toLocaleString('pt-BR')} na conta\n> 🧼 **Sujo:** $${sujo.toLocaleString('pt-BR')} — lavra isso com \`k lavar\` antes de gastar!\n*🍀 Sorte (Nv. ${sorteLvl}) rendeu +${(sorteLvl * 5).toFixed(0)}% no lucro.*`);
        }

        // ==========================================
        // 💥 FALHA: a fiscal apertou o cerco
        // ==========================================
        const multa = Math.floor(lucro / 2);
        await prisma.user.update({
            where: { userId },
            data: { balance: { decrement: Math.min(multa, userDb.balance) } }
        });

        const embedRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('contra_intercept').setLabel('🚨 INTERCEPTAR!').setStyle(ButtonStyle.Danger)
        );

        const alertMsg = await message.channel.send({
            content: `📢 **COMUNICADO DA RÁDIO DA PM:**\n\n🚨 *"Alô ROTA, alô ROTA! Fiscal flagrou um contrabandista tentando atravessar carga na fronteira! O <@${userId}> perdeu a mercadoria e correu pro mato! Se algum Oficial estiver na área, vai pra cima!"*\n\n*O contrabandista tá **${TEMPO / 1000} segundos** tentando sumir. Quem é Oficial da PM pode interceptar!*`,
            components: [embedRow]
        });

        // Registra o alerta pra o componente contra_intercept resolver (sem conflito de collector)
        global.activeContrabando = global.activeContrabando || new Map();
        global.activeContrabando.set(alertMsg.id, { smugglerId: userId, guildId, multa });

        // Limpeza: se nenhum PM responder em 60s, o contrabandista some
        setTimeout(() => {
            global.activeContrabando?.delete(alertMsg.id);
            alertMsg.edit({
                content: `💨 **FIM DO PROTOCOLO!**\n\nNenhum Oficial respondeu ao chamado e o <@${userId}> conseguiu sumir no mato depois de perder a carga (e **$${multa.toLocaleString('pt-BR')}** no buraco).\n\n*A ROTA foi almoçar.*`,
                components: []
            }).catch(() => {});
        }, TEMPO);

        return message.reply(`💥 **CONTRABANDO QUEIMOU!**\n\nA fiscal flagrou a carga na fronteira e você teve que largar tudo pra não ir junto! Prejuízo de **$${multa.toLocaleString('pt-BR')}**.\n\n*Agora é esperar pra ver se a ROTA responde ao chamado...*`);
    }
};
