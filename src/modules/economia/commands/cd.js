import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateCdCanvas } from '../../../utils/canvasCd.js';

export default {
    name: 'cd',
    execute: async (message) => {
        const cds = await prisma.cooldown.findMany({ where: { userId: message.author.id } });
        
        // Filtra cooldowns expirados apenas por segurança (opcional, mas bom)
        const activeCds = cds.filter(c => new Date(c.expiresAt) > new Date());

        const buffer = await generateCdCanvas(message.author, activeCds);
        const attachment = new AttachmentBuilder(buffer, { name: 'cd_panel.png' });

        await message.channel.send({ files: [attachment] });
    }
};