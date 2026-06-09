// src/modules/economia/commands/cd.js
import { prisma } from '../../../core/database.js';

export default {
    name: 'cd',
    execute: async (message) => {
        const cds = await prisma.cooldown.findMany({ where: { userId: message.author.id } });
        if (cds.length === 0) return message.reply('# ✅ SEM ESPERAS\n**Você está livre para usar todos os comandos!**');

        let texto = '# ⏳ SEUS COOLDOWNS\n';
        cds.forEach(c => {
            const horas = Math.ceil((c.expiresAt - new Date()) / 3600000);
            texto += `**${c.command.toUpperCase()}**: Restam ${horas}h\n`;
        });
        message.reply(texto);
    }
};