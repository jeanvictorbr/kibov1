import { prisma } from '../../../core/database.js';
import { checkCooldown, setCooldown } from '../../../utils/cooldownManager.js';

export default {
    name: 'executar',
    execute: async (message) => {
        const userId = message.author.id;
        
        // 1. Verifica Cooldown
        const tempoCD = await checkCooldown(userId, 'executar');
        if (tempoCD) {
            const horas = Math.ceil((tempoCD - new Date()) / 3600000);
            return message.reply(`# ⏳ DESCANSO FORÇADO\n**Você está exausto, chefe!**\nAguarde ${horas} hora(s) para voltar ao trabalho.`);
        }

        const user = await prisma.user.findUnique({ where: { userId } });
        
        if (!user || user.currentJob === "desempregado") {
            return message.reply('**Você está desempregado, chefe!**\nUse `k trabalhar` para escolher uma profissão.');
        }

        const jobs = {
            onesto: { min: 500, max: 1000, risco: 0, msg: "Você fez um trabalho exemplar hoje, patrão!" },
            crime: { min: 2000, max: 5000, risco: 0.5, msg: "Você agiu nas sombras e o serviço foi concluído com sucesso!" },
            hacker: { min: 10000, max: 20000, risco: 0.8, msg: "Você invadiu os servidores com maestria, que sorte a nossa!" }
        };

        const jobData = jobs[user.currentJob];
        
        // Check Risco
        if (Math.random() < jobData.risco) {
            // Se for pego, definimos cooldown de 2 horas como punição
            await setCooldown(userId, 'executar', 2);
            return message.reply('# 🚨 FLAGRANTE!\n**A polícia apareceu do nada e você teve que abandonar tudo para não ser preso.**\n*Fica esperto na próxima, vida de crime é assim mesmo.*');
        }

        const ganho = Math.floor(Math.random() * (jobData.max - jobData.min) + jobData.min);
        
        // Aplica o ganho
        await prisma.user.update({ 
            where: { userId: user.userId }, 
            data: { balance: { increment: ganho } } 
        });

        // 2. Define o Cooldown de 2 horas após o sucesso
        await setCooldown(userId, 'executar', 2);
        
        return message.reply(`# 💰 PAGAMENTO RECEBIDO\n**Cargo:** ${user.currentJob.toUpperCase()}\n**Status:** ${jobData.msg}\n**Lucro:** $${ganho.toLocaleString()}\n*O dinheiro já está na sua carteira, chefe!*`);
    }
};