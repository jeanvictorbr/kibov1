import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateCdCanvas } from '../../../utils/canvasCd.js';

export default {
    name: 'cd',
    execute: async (message) => {
        // Busca todos os cooldowns ativos deste usuário
        const cds = await prisma.cooldown.findMany({ 
            where: { 
                userId: message.author.id,
                expiresAt: { gt: new Date() } // Apenas os que ainda não expiraram
            } 
        });

        const buffer = await generateCdCanvas(message.author, cds);
        const attachment = new AttachmentBuilder(buffer, { name: 'cd_panel.png' });

        await message.channel.send({ files: [attachment] });
    }
};