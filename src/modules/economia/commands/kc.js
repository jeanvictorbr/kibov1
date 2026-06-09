import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateKcCanvas } from '../../../utils/canvasProfile.js'; // Ajuste o import se usar um arquivo novo

export default {
    name: 'kc',
    execute: async (message, args, client, reply) => {
        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        
        if (!user) {
            return message.reply('**Chefe, você ainda não tem um perfil registrado.** Tente `k perfil` primeiro.');
        }

        const buffer = await generateKcCanvas(message.author, user);
        const attachment = new AttachmentBuilder(buffer, { name: 'kc_profile.png' });

        await message.channel.send({ files: [attachment] });
    }
};