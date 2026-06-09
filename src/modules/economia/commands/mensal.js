// src/modules/economia/commands/mensal.js
import { prisma } from '../../../core/database.js';
import { checkCooldown, setCooldown } from '../../../utils/cooldownManager.js';

export default {
    name: 'mensal',
    execute: async (message) => {
        const userId = message.author.id;
        const tempoCD = await checkCooldown(userId, 'mensal');
        
        if (tempoCD) {
            const dias = Math.ceil((tempoCD - new Date()) / 86400000);
            return message.reply(`📅 **Você já resgatou o prémio deste mês!**\nFaltam **${dias} dia(s)** para o próximo.`);
        }

        const premio = 100000; // Valor alto para o mensal
        await prisma.user.update({ where: { userId }, data: { balance: { increment: premio } } });
        
        // Define o Cooldown de 720 horas (30 dias)
        await setCooldown(userId, 'mensal', 720);
        
        return message.reply(`# 💎 PRÉMIO MENSAL\n**Parabéns, chefe! Você recebeu um bónus de $${premio.toLocaleString()} por sua fidelidade.**\n*Nos vemos mês que vem.*`);
    }
};