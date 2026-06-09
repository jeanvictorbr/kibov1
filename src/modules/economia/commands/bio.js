import { prisma } from '../../../core/database.js';

export default {
    name: 'bio',
    execute: async (message, args) => {
        const novaBio = args.join(' ');

        if (!novaBio) {
            return message.reply('**Chefe, me diz o que queres escrever na tua bio!**\nExemplo: `k bio O terror do Banco Central ☠️`');
        }

        if (novaBio.length > 120) {
            return message.reply('**Biografia demasiado longa, patrão!** O limite máximo são 120 caracteres para caber perfeitamente no cartão.');
        }

        // Atualiza ou cria o utilizador com a nova bio
        await prisma.user.upsert({
            where: { userId: message.author.id },
            update: { bio: novaBio },
            create: { userId: message.author.id, bio: novaBio }
        });

        return message.reply('✅ **Sua biografia foi atualizada com sucesso!** Digita `k perfil` para veres o resultado.');
    }
};