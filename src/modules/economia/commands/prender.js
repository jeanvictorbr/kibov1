import { EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    name: 'prender',
    execute: async (message, args) => {
        const copId = message.author.id;
        const guildId = message.guild.id;

        // 1. Verifica se quem executou é um Polícia no banco de dados
        const copDb = await prisma.user.findUnique({ where: { userId: copId } });
        if (!copDb || copDb.currentJob !== 'policial') {
            return message.reply('❌ Qual foi, chefe? Você não é Oficial de Polícia! Bate um papo com o Delegado lá no `k trabalhar`.');
        }

        // 2. Verifica se ele tem o distintivo DESTA cidade (Jurisdição)
        const hasBadge = await prisma.policeBadge.findUnique({
            where: { userId_guildId: { userId: copId, guildId: guildId } }
        });

        if (!hasBadge) {
            return message.reply('🛑 **Fora de Jurisdição, mano!** Seu distintivo não vale nessa quebrada. Fica no seu quadrado!');
        }

        // 3. Verifica o Alvo
        const targetUser = message.mentions.users.first();
        if (!targetUser) return message.reply('🚓 Você precisa marcar quem vai tomar o enquadro! Ex: `k prender @suspeito`');
        if (targetUser.id === copId) return message.reply('🤨 Tá querendo se prender, truta? Procura um psicólogo.');
        if (targetUser.bot) return message.reply('🤖 Tá chapando? O Kibo não vai em cana não, chefe!');

        const targetDb = await prisma.user.findUnique({ where: { userId: targetUser.id } });
        
        if (!targetDb || (targetDb.currentJob !== 'ladrao' && targetDb.currentJob !== 'hacker')) {
            return message.reply('⚖️ **Abuso de Autoridade!** O mano é cidadão honesto (ou tá desempregado). Você só pode enquadrar Ladrão e Hacker.');
        }

        // 4. Verifica se o Polícia está em Cooldown (cansado)
        const copCooldown = await prisma.cooldown.findUnique({
            where: { userId_command: { userId: copId, command: 'prender' } }
        });

        if (copCooldown && copCooldown.expiresAt > new Date()) {
            const minutos = Math.ceil((copCooldown.expiresAt - new Date()) / 60000);
            return message.reply(`⏳ Cê tá cansado da última perseguição, chefe! Dá uma respirada na viatura por mais **${minutos} minutos**.`);
        }

        // 5. Verifica se o Alvo JÁ ESTÁ na prisão
        const jailCooldown = await prisma.cooldown.findUnique({
            where: { userId_command: { userId: targetUser.id, command: 'preso' } }
        });

        if (jailCooldown && jailCooldown.expiresAt > new Date()) {
            return message.reply('🔒 O mano já tá puxando pena em Alcatraz, deixa ele quieto lá!');
        }

        // --- SISTEMA DE COMBATE (60% de chance de prender) ---
        const chanceDeSucesso = Math.random() * 100;

        // Se o Polícia falhar na captura...
        if (chanceDeSucesso > 60) {
            // Polícia toma um cooldown de 5 minutos
            const penaltyTime = new Date(Date.now() + 5 * 60 * 1000);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId: copId, command: 'prender' } },
                update: { expiresAt: penaltyTime },
                create: { userId: copId, command: 'prender', expiresAt: penaltyTime }
            });

            return message.reply(`💨 **FUGA!** O <@${targetUser.id}> jogou a fumaça e meteu o pé pelo beco. Você comeu poeira na perseguição, mano!`);
        }

        // --- SE O POLÍCIA GANHAR ---
        
        // Coloca o bandido na PRISÃO por 30 minutos
        const jailTime = new Date(Date.now() + 30 * 60 * 1000);
        await prisma.cooldown.upsert({
            where: { userId_command: { userId: targetUser.id, command: 'preso' } },
            update: { expiresAt: jailTime },
            create: { userId: targetUser.id, command: 'preso', expiresAt: jailTime }
        });

        // Confisca o dinheiro (10% da carteira do alvo vai para o Polícia)
        let confisco = 0;
        if (targetDb.balance > 0) {
            confisco = Math.floor(targetDb.balance * 0.10); // 10%

            // Tira do bandido e dá ao Polícia numa única tacada de banco
            await prisma.$transaction([
                prisma.user.update({ where: { userId: targetUser.id }, data: { balance: { decrement: confisco } } }),
                prisma.user.update({ where: { userId: copId }, data: { balance: { increment: confisco } } })
            ]);
        }

        // Mensagem Épica de Captura
        const embed = new EmbedBuilder()
            .setTitle('🚨 BUSTED! PERDEU, PLAYBOY! 🚨')
            .setDescription(`O Oficial <@${copId}> deu o bote e jogou o criminoso <@${targetUser.id}> no camburão!`)
            .setColor('#0000FF')
            .addFields(
                { name: 'Sentença', value: '🔒 30 Minutos em Alcatraz', inline: true },
                { name: 'Dinheiro Apreendido', value: `💰 $${confisco.toLocaleString('pt-BR')}`, inline: true }
            )
            .setThumbnail(targetUser.displayAvatarURL());

        return message.reply({ embeds: [embed] });
    }
};