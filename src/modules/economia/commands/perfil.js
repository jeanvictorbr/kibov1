import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateProfileCanvas } from '../../../utils/canvasProfile.js';

export default {
    name: 'perfil',
    execute: async (message, args, client, reply) => {
        // Busca o usuário no banco ou cria se não existir
        let user = await prisma.user.findUnique({
            where: { userId: message.author.id }
        });

        if (!user) {
            user = await prisma.user.create({
                data: { userId: message.author.id }
            });
        }

        try {
            // Gera o perfil visual
            const buffer = await generateProfileCanvas(message.author, user);
            const attachment = new AttachmentBuilder(buffer, { name: 'perfil_kibo.png' });

            await message.channel.send({ files: [attachment] });
        } catch (err) {
            console.error("Erro ao gerar perfil:", err);
            reply({ description: 'Opa chefe, tive um problema ao desenhar o teu perfil. Tenta novamente.' });
        }
    }
};