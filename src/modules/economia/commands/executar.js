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

        // 2. VERIFICAÇÃO DO ITEM E HABILIDADES
        const temAmuleto = await prisma.inventory.findFirst({
            where: { userId: userId, itemId: 'Amuleto' }
        });

        // Extrai as habilidades e calcula o bônus de Sorte
        const skills = typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || {});
        const sorteLvl = skills.sorte || 1;
        const bonusSorte = sorteLvl * 0.05; // 5% por cada nível

        const jobs = {
            onesto: { min: 500, max: 1000, risco: 0, msg: "Você fez um trabalho exemplar hoje, patrão!" },
            crime: { min: 2000, max: 5000, risco: 0.5, msg: "Você agiu nas sombras e o serviço foi concluído com sucesso!" },
            hacker: { min: 10000, max: 20000, risco: 0.8, msg: "Você invadiu os servidores com maestria, que sorte a nossa!" }
        };

        const jobData = jobs[user.currentJob];
        
        // Check Risco (Flagrante da Polícia)
        if (Math.random() < jobData.risco) {
            await setCooldown(userId, 'executar', 2);
            return message.reply('# 🚨 FLAGRANTE!\n**A polícia apareceu do nada e você teve que abandonar tudo para não ser preso.**');
        }

        // Calcula o ganho base
        let ganho = Math.floor(Math.random() * (jobData.max - jobData.min) + jobData.min);
        
        // Aplica o buff do Amuleto
        if (temAmuleto) {
            ganho = Math.floor(ganho * 1.5);
        }

        // Aplica o lucro extra do Nível de Sorte
        ganho = Math.floor(ganho * (1 + bonusSorte));

        // Paga o trabalhador
        await prisma.user.update({ 
            where: { userId: user.userId }, 
            data: { balance: { increment: ganho } } 
        });

        // 3. Define o Cooldown de 2 horas
        await setCooldown(userId, 'executar', 2);
        
        let replyMsg = `# 💰 PAGAMENTO RECEBIDO\n**Cargo:** ${user.currentJob.toUpperCase()}\n**Status:** ${jobData.msg}\n**Lucro:** $${ganho.toLocaleString()}`;
        if (temAmuleto) replyMsg += `\n*💎 Seu **Amuleto** aumentou seu ganho!*`;
        
        // Adiciona a frase da Sorte no final
        replyMsg += `\n*🍀 A sua **Sorte (Nível ${sorteLvl})** rendeu +${(bonusSorte * 100).toFixed(0)}% de lucro!*`;
        
        return message.reply(replyMsg);
    }
};