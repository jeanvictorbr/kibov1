// src/modules/economia/commands/executar.js
import { prisma } from '../../../core/database.js';

export default {
    name: 'executar',
    execute: async (message) => {
        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        
        if (!user || user.currentJob === "desempregado") {
            return message.reply('**Você está desempregado, chefe!**\nUse `k trabalhar` para escolher uma profissão.');
        }

        const jobs = {
            onesto: { min: 500, max: 1000, risco: 0, msg: "Você fez um trabalho exemplar hoje, patrão!" },
            crime: { min: 2000, max: 5000, risco: 0.5, msg: "Você agiu nas sombras e o serviço foi concluído com sucesso!" },
            hacker: { min: 10000, max: 20000, risco: 0.8, msg: "Você invadiu os servidores com maestria, que sorte a nossa!" }
        };

        const jobData = jobs[user.currentJob];
        
        // Check Risco (A polícia não perdoa)
        if (Math.random() < jobData.risco) {
            return message.reply('# 🚨 FLAGRANTE!\n**A polícia apareceu do nada e você teve que abandonar tudo para não ser preso.**\n*Fica esperto na próxima, vida de crime é assim mesmo.*');
        }

        const ganho = Math.floor(Math.random() * (jobData.max - jobData.min) + jobData.min);
        
        // Aplica o ganho
        await prisma.user.update({ 
            where: { userId: user.userId }, 
            data: { balance: { increment: ganho } } 
        });
        
        return message.reply(`# 💰 PAGAMENTO RECEBIDO\n**Cargo:** ${user.currentJob.toUpperCase()}\n**Status:** ${jobData.msg}\n**Lucro:** $${ganho.toLocaleString()}\n*O dinheiro já está na sua carteira, chefe!*`);
    }
};