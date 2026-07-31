import { prisma } from '../../../core/database.js';

export default {
    name: 'revistar',
    execute: async (message) => {
        const copId = message.author.id;
        const guildId = message.guild.id;

        // 1. Só PM com distintivo na cidade
        const copDb = await prisma.user.findUnique({ where: { userId: copId } });
        if (!copDb || copDb.currentJob !== 'policial') {
            return message.reply('🛑 Cadê a farda, zé povinho? Revistar é serviço da Polícia.');
        }

        const hasBadge = await prisma.policeBadge.findUnique({
            where: { userId_guildId: { userId: copId, guildId } }
        });
        if (!hasBadge) {
            return message.reply('🛑 **Fora de Jurisdição!** Você não tem distintivo nessa cidade pra revistar ninguém.');
        }

        // 2. Cooldown de 10 minutos
        const cd = await prisma.cooldown.findUnique({
            where: { userId_command: { userId: copId, command: 'revistar' } }
        });
        if (cd && cd.expiresAt > new Date()) {
            const minutos = Math.ceil((cd.expiresAt - new Date()) / 60000);
            return message.reply(`🚓 Você acabou de fazer uma blitz! Espera **${minutos} minutos** pra revistar de novo.`);
        }

        // 3. Alvo
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('🚓 Marca quem quer revistar! Ex: `k revistar @user`');
        }
        if (targetUser.id === copId) {
            return message.reply('🤨 Revistar a si mesmo? Cê sabe onde tá a grana, chefe.');
        }
        if (targetUser.bot) {
            return message.reply('🤖 O Kibo só carrega código-fonte, nada suspeito!');
        }

        const targetDb = await prisma.user.findUnique({ where: { userId: targetUser.id } });
        if (!targetDb || !targetDb.dirtyMoney || targetDb.dirtyMoney < 100) {
            // Registra cooldown mesmo assim pra evitar spam de blitz
            const nextTime = new Date(Date.now() + 10 * 60 * 1000);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId: copId, command: 'revistar' } },
                update: { expiresAt: nextTime },
                create: { userId: copId, command: 'revistar', expiresAt: nextTime }
            });
            return message.reply(`🔍 O Oficial <@${copId}> revistou o <@${targetUser.id}> e não achou NADA de ilícito!\n\n*O <@${targetUser.id}> tava com a consciência limpa (ou escondeu bem a grana suja).*`);
        }

        const achou = Math.random() < 0.6; // 60% de chance de achar a grana suja
        const apreendido = achou ? Math.floor(targetDb.dirtyMoney * 0.3) : 0;
        const bonusDelegacia = achou ? Math.floor(apreendido * 0.1) : 0;

        const nextTime = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.cooldown.upsert({
            where: { userId_command: { userId: copId, command: 'revistar' } },
            update: { expiresAt: nextTime },
            create: { userId: copId, command: 'revistar', expiresAt: nextTime }
        });

        if (!achou || apreendido <= 0) {
            return message.reply(`🔍 O Oficial <@${copId}> revistou o <@${targetUser.id}> de cima a baixo e NÃO achou nada!\n\n*O safado já tinha lavado toda a grana suja a tempo.*`);
        }

        await prisma.$transaction([
            prisma.user.update({ where: { userId: targetUser.id }, data: { dirtyMoney: { decrement: apreendido } } }),
            prisma.user.update({ where: { userId: copId }, data: { balance: { increment: bonusDelegacia } } })
        ]);

        return message.reply(`🚨 **BLITZ NO MORRO!**\n\nO Oficial <@${copId}> mandou o <@${targetUser.id}> encostar e revirou o bolso dele na hora!\n\n> 🧼 **Apreendido:** **$${apreendido.toLocaleString('pt-BR')}** de grana suja virou evidência na Delegacia!\n> 💰 O Oficial ganhou **$${bonusDelegacia.toLocaleString('pt-BR')}** de bônus da Delegacia pelo achado.\n\n*O <@${targetUser.id}> tá de cara pro chão. Quem guarda grana suja, perde tudo!*`);
    }
};
