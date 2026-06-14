import { prisma } from '../../../core/database.js';

export default {
    name: 'prender',
    execute: async (message) => {
        const copId = message.author.id;
        const guildId = message.guild.id;

        // 1. Verifica se o usuário é PM e se tem distintivo na cidade
        const copDb = await prisma.user.findUnique({ where: { userId: copId } });
        if (!copDb || copDb.currentJob !== 'policial') {
            return message.reply('🛑 Sai da frente, zé povinho! Você não é da polícia pra querer enquadrar os outros.');
        }

        const hasBadge = await prisma.policeBadge.findUnique({
            where: { userId_guildId: { userId: copId, guildId: guildId } }
        });

        if (!hasBadge) {
            return message.reply('🛑 **Fora de Jurisdição!** Você não tem distintivo neste servidor pra dar enquadro.');
        }

        // 2. Cooldown de cansaço (5 mins) caso ele tenha falhado num enquadro antes
        const copCooldown = await prisma.cooldown.findUnique({
            where: { userId_command: { userId: copId, command: 'cansaco_pm' } }
        });

        if (copCooldown && copCooldown.expiresAt > new Date()) {
            const minutos = Math.ceil((copCooldown.expiresAt - new Date()) / 60000);
            return message.reply(`🚓 Você tá exausto do último coringa que te deu fuga! Descansa a viatura por mais **${minutos} minutos** antes de dar outro bote.`);
        }

        // 3. Define o alvo
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('🚓 Menciona aí quem você quer enquadrar! Ex: `k prender @user`');
        }

        if (targetUser.id === copId) {
            return message.reply('🤨 Qual foi? Você tá tentando prender a si mesmo? Tá chapando!');
        }

        if (targetUser.bot) {
            return message.reply('🤖 O Kibo não comete crimes, oficial. Procura um bandido de verdade!');
        }

        // 4. Verifica se o alvo é bandido
        const robberDb = await prisma.user.findUnique({ where: { userId: targetUser.id } });
        if (!robberDb || (robberDb.currentJob !== 'ladrao' && robberDb.currentJob !== 'hacker')) {
            return message.reply(`❌ O <@${targetUser.id}> é trabalhador honesto (ou desempregado). Você não pode prender civil sem provas!`);
        }

        // Verifica se o bandido já tá preso
        const isJailed = await prisma.cooldown.findUnique({
            where: { userId_command: { userId: targetUser.id, command: 'preso' } }
        });

        if (isJailed && isJailed.expiresAt > new Date()) {
            return message.reply(`🕊️ O <@${targetUser.id}> já tá puxando cadeia em Alcatraz. Vai prender o cara duas vezes?`);
        }

        // --- ROLETA DO ENQUADRO (60% da PM ganhar) ---
        const chance = Math.random() * 100;

        if (chance <= 60) {
            // SUCESSO: PM ganhou
            
            // Calcula os 10% de confisco
            const confisco = Math.floor(robberDb.balance * 0.10);
            
            // Prende por 30 minutos e transfere o dinheiro
            const jailTime = new Date(Date.now() + 30 * 60 * 1000);
            await prisma.$transaction([
                prisma.cooldown.upsert({
                    where: { userId_command: { userId: targetUser.id, command: 'preso' } },
                    update: { expiresAt: jailTime },
                    create: { userId: targetUser.id, command: 'preso', expiresAt: jailTime }
                }),
                prisma.user.update({
                    where: { userId: targetUser.id },
                    data: { balance: { decrement: confisco } }
                }),
                prisma.user.update({
                    where: { userId: copId },
                    data: { balance: { increment: confisco } }
                })
            ]);

            return message.reply(`🚨 **BUSTEED! ENQUADRO PERFEITO!**\n\nO Oficial <@${copId}> botou a arma na cara do <@${targetUser.id}> no meio da rua!\n\n🔒 **Punição:** O vagabundo pegou 30 minutos de tranca em Alcatraz!\n💰 **Confisco:** O Oficial raspou **$${confisco.toLocaleString('pt-BR')}** (10%) da carteira do bandido e guardou no bolso!`);
        } else {
            // FALHA: Bandido deu fuga e PM cansa
            
            const restTime = new Date(Date.now() + 5 * 60 * 1000);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId: copId, command: 'cansaco_pm' } },
                update: { expiresAt: restTime },
                create: { userId: copId, command: 'cansaco_pm', expiresAt: restTime }
            });

            return message.reply(`💨 **DEU RUIM! O CARA É LISO!**\n\nO Oficial <@${copId}> tentou dar o bote, mas o <@${targetUser.id}> pulou o muro, atravessou o beco e sumiu da visão!\n\n🚓 A polícia comeu poeira e vai precisar de **5 minutos** pra abastecer a viatura e tentar de novo.`);
        }
    }
};