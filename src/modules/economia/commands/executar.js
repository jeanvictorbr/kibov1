// src/modules/economia/commands/executar.js
import { prisma } from '../../../core/database.js';

export default {
    name: 'executar',
    execute: async (message) => {
        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        
        if (!user || user.currentJob === "desempregado") return message.reply('**Você está desempregado!** Digite `k trabalhar`.');

        const jobs = {
            onesto: { min: 500, max: 1000, risco: 0 },
            crime: { min: 2000, max: 5000, risco: 0.5 },
            hacker: { min: 10000, max: 20000, risco: 0.8 }
        };

        const jobData = jobs[user.currentJob];
        
        // Check Risco
        if (Math.random() < jobData.risco) {
            return message.reply('# 🚓 FOI PRESO!\n**A polícia te pegou no flagra.**');
        }

        const ganho = Math.floor(Math.random() * (jobData.max - jobData.min) + jobData.min);
        await prisma.user.update({ where: { userId: user.userId }, data: { balance: { increment: ganho } } });
        
        return message.reply(`# 💰 PAGAMENTO\n**Profissão:** ${user.currentJob.toUpperCase()}\n**Ganho:** $${ganho.toLocaleString()}`);
    }
};