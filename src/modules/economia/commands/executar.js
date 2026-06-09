// src/modules/economia/commands/executar.js
import { prisma } from '../../../core/database.js';

export default {
    name: 'executar',
    execute: async (message) => {
        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        
        // 1. Bloqueio de 3 dias
        const tresDias = 3 * 24 * 60 * 60 * 1000;
        if (user.jobStartedAt && (new Date() - new Date(user.jobStartedAt) < tresDias)) {
            const horas = Math.ceil((tresDias - (new Date() - new Date(user.jobStartedAt))) / 3600000);
            return message.reply(`**Você ainda está sob contrato!**\nAguarde ${horas} horas para mudar de profissão.`);
        }

        // 2. Lógica de Ganhos por Profissão
        const jobs = {
            onesto: { min: 500, max: 1000, risco: 0 },
            crime: { min: 2000, max: 5000, risco: 0.5 },
            hacker: { min: 10000, max: 20000, risco: 0.8 }
        };

        const jobData = jobs[user.currentJob];
        if (!jobData) return message.reply('**Você não tem um emprego!** Digite `k trabalhar` primeiro.');

        // Risco de ser pego
        if (Math.random() < jobData.risco) {
            return message.reply('# 🚓 PRISÃO!\n**Você tentou realizar o serviço mas a polícia te pegou!**\nPerdeu todo o ganho desta vez.');
        }

        const ganho = Math.floor(Math.random() * (jobData.max - jobData.min) + jobData.min);
        await prisma.user.update({ where: { userId: user.userId }, data: { balance: { increment: ganho } } });
        
        return message.reply(`# 💰 PAGAMENTO RECEBIDO\n**Profissão: ${user.currentJob.toUpperCase()}**\nVocê ganhou $${ganho.toLocaleString()}!`);
    }
};