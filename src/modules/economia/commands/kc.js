import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
// Corrigido o nome da função para bater com o que realmente existe no ficheiro
import { generateProfileCanvas } from '../../../utils/canvasProfile.js'; 

export default {
    name: 'kc',
    execute: async (message, args, client, reply) => {
        const user = await prisma.user.findUnique({ where: { userId: message.author.id } });
        
        if (!user) {
            return message.reply('**Chefe, você ainda não tem um perfil registrado.** Tente `k perfil` primeiro.');
        }

        // Usando a função correta
        const buffer = await generateProfileCanvas(message.author, user);
        const attachment = new AttachmentBuilder(buffer, { name: 'kc_profile.png' });

        await message.channel.send({ files: [attachment] });
    }
};