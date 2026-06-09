// src/modules/economia/commands/kc.js
import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateKcCanvas } from '../../../utils/canvasKc.js'; 

export default {
    name: 'c',
    execute: async (message, args, client, reply) => {
        let user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (!user) {
            user = await prisma.user.create({ data: { userId: message.author.id } });
        }

        const buffer = await generateKcCanvas(message.author, user);
        const attachment = new AttachmentBuilder(buffer, { name: 'kibo_cash.png' });

        await message.channel.send({ files: [attachment] });
    }
};