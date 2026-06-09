// src/modules/economia/commands/daily.js
import { prisma } from '../../../core/database.js';
import { checkCooldown, setCooldown } from '../../../utils/cooldownManager.js';

export default {
    name: 'daily',
    execute: async (message) => {
        const userId = message.author.id;
        const tempoCD = await checkCooldown(userId, 'daily');
        
        if (tempoCD) {
            const horas = Math.ceil((tempoCD - new Date()) / 3600000);
            return message.reply(`⏳ **Calma, chefe!**\nVocê já resgatou seu prémio hoje. Volte em **${horas} hora(s)**.`);
        }

        const premio = 5000; // Valor fixo do Daily
        await prisma.user.update({ where: { userId }, data: { balance: { increment: premio } } });
        
        // Define o Cooldown de 24 horas
        await setCooldown(userId, 'daily', 24);
        
        return message.reply(`# 🎁 PRÉMIO DIÁRIO\n**Você resgatou $${premio.toLocaleString()} com sucesso!**\n*Volte amanhã para mais.*`);
    }
};