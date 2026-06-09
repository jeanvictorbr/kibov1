import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateCdCanvas } from '../../../utils/canvasCd.js';

export default {
    name: 'cd',
    execute: async (message) => {
        const userId = message.author.id;
        const allCommands = ['executar', 'daily', 'mensal']; // Lista de comandos para monitorar
        
        // Busca apenas os cooldowns existentes no banco
        const userCds = await prisma.cooldown.findMany({ where: { userId } });

        // Mapeia para saber o status de cada um
        const statusList = allCommands.map(cmdName => {
            const cd = userCds.find(c => c.command === cmdName);
            if (cd && new Date(cd.expiresAt) > new Date()) {
                return { command: cmdName, expiresAt: cd.expiresAt, status: 'active' };
            }
            return { command: cmdName, status: 'available' };
        });

        const buffer = await generateCdCanvas(message.author, statusList);
        const attachment = new AttachmentBuilder(buffer, { name: 'cd_panel.png' });

        await message.channel.send({ files: [attachment] });
    }
};