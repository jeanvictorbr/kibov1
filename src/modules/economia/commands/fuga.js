import { EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    name: 'fuga',
    execute: async (message) => {
        const userId = message.author.id;

        // Verifica se o maluco tá preso mesmo
        const jailCooldown = await prisma.cooldown.findUnique({
            where: { userId_command: { userId, command: 'preso' } }
        });

        if (!jailCooldown || jailCooldown.expiresAt < new Date()) {
            return message.reply('🕊️ Tá chapando, chefe? Você tá solto na rua, livre leve e solto. Foge do vento?');
        }

        // Verifica se já tentou fugir agora a pouco (Cooldown da fuga de 10 min)
        const fugaCooldown = await prisma.cooldown.findUnique({
            where: { userId_command: { userId, command: 'fuga' } }
        });

        if (fugaCooldown && fugaCooldown.expiresAt > new Date()) {
            const minutos = Math.ceil((fugaCooldown.expiresAt - new Date()) / 60000);
            return message.reply(`🤕 Calma aí, truta! Os guardas te deram um cacete agorinha. Espera mais **${minutos} minutos** pra tentar cavar outro buraco.`);
        }

        // 30% DE CHANCE DE ESCAPAR DA PRISÃO
        const chance = Math.random() * 100;

        if (chance <= 30) {
            // SUCESSO: Apaga a prisão do banco de dados!
            await prisma.cooldown.delete({
                where: { userId_command: { userId, command: 'preso' } }
            });

            const embedSucesso = new EmbedBuilder()
                .setTitle('🔓 FUGA BEM SUCEDIDA!')
                .setDescription(`Cê é liso mesmo, <@${userId}>! Você serrou as grades, pulou o muro e meteu o pé de Alcatraz. A rua é sua de novo!`)
                .setColor('#00FF66');

            return message.reply({ embeds: [embedSucesso] });
        } else {
            // FALHA: Adiciona 15 minutos na pena e dá cooldown pra tentar de novo
            const novaPena = new Date(jailCooldown.expiresAt.getTime() + 15 * 60 * 1000); // +15 mins
            const cooldownFuga = new Date(Date.now() + 10 * 60 * 1000); // 10 mins sem poder tentar

            await prisma.$transaction([
                prisma.cooldown.update({
                    where: { userId_command: { userId, command: 'preso' } },
                    data: { expiresAt: novaPena }
                }),
                prisma.cooldown.upsert({
                    where: { userId_command: { userId, command: 'fuga' } },
                    update: { expiresAt: cooldownFuga },
                    create: { userId, command: 'fuga', expiresAt: cooldownFuga }
                })
            ]);

            const embedFalha = new EmbedBuilder()
                .setTitle('🚨 FUGA FRUSTRADA!')
                .setDescription(`As sirenes tocaram, chefe! Os guardas te pegaram no pulo em cima do muro.\n\n**Consequência:** Tomou uma surra e sua pena aumentou em +15 Minutos!`)
                .setColor('#FF0000');

            return message.reply({ embeds: [embedFalha] });
        }
    }
};