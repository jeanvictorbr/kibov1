import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';

// Memória RAM para guardar os assaltos em andamento
if (!global.activeRobberies) global.activeRobberies = new Map();

export default {
    name: 'assaltar_caixa',
    execute: async (message) => {
        const userId = message.author.id;
        const guildId = message.guild.id;

        // 1. Verifica se é Ladrão
        const userDb = await prisma.user.findUnique({ where: { userId } });
        if (!userDb || userDb.currentJob !== 'ladrao') {
            return message.reply('❌ Você não tem a manha do crime, chefe. Só quem é `Ladrão` de carteira assinada no submundo sabe estourar um caixa!');
        }

        // 2. Verifica Cooldown (1 hora)
        const cooldownDb = await prisma.cooldown.findUnique({
            where: { userId_command: { userId, command: 'assaltar_caixa' } }
        });

        if (cooldownDb && cooldownDb.expiresAt > new Date()) {
            const minutos = Math.ceil((cooldownDb.expiresAt - new Date()) / 60000);
            return message.reply(`⏳ A poeira ainda não baixou da última explosão! Fica na miúda por mais **${minutos} minutos** pra polícia não te rastrear.`);
        }

        // Aplica o Cooldown de 1 hora
        const nextTime = new Date(Date.now() + 60 * 60 * 1000);
        await prisma.cooldown.upsert({
            where: { userId_command: { userId, command: 'assaltar_caixa' } },
            update: { expiresAt: nextTime },
            create: { userId, command: 'assaltar_caixa', expiresAt: nextTime }
        });

        const lucro = Math.floor(Math.random() * (150000 - 50000 + 1)) + 50000; // Entre 50k e 150k

        const embed = new EmbedBuilder()
            .setTitle('🚨 ALERTA 190: ASSALTO EM ANDAMENTO!')
            .setDescription(`O <@${userId}> plantou o C4 no Caixa Eletrônico da Koda Tech e está esperando estourar para levar **$${lucro.toLocaleString('pt-BR')}**!\n\n**🚓 A polícia tem 2 MINUTOS para chegar na cena e impedir o crime!**`)
            .setColor('#FF8C00')
            .setImage('https://i.imgur.com/8Qe8g2G.png'); // Pode trocar por um gif de explosão

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('assalto_intervir')
                .setLabel('🚓 IMPEDIR ASSALTO')
                .setStyle(ButtonStyle.Danger)
        );

        const assaltoMsg = await message.channel.send({ content: '@here 🚨 **Atenção Unidades!**', embeds: [embed], components: [row] });

        // Salva na memória do bot
        global.activeRobberies.set(assaltoMsg.id, {
            robberId: userId,
            guildId: guildId,
            loot: lucro
        });

        // O Temporizador de 2 Minutos (Se a polícia não aparecer, o ladrão ganha)
        setTimeout(async () => {
            const robberyData = global.activeRobberies.get(assaltoMsg.id);
            if (!robberyData) return; // Se a polícia já clicou, a memória foi apagada, então não faz nada.

            // Ninguém clicou, o Ladrão ganhou!
            global.activeRobberies.delete(assaltoMsg.id);

            await prisma.user.update({
                where: { userId: robberyData.robberId },
                data: { balance: { increment: robberyData.loot } }
            });

            const embedSucesso = new EmbedBuilder()
                .setTitle('💥 CAIXA ESTOURADO COM SUCESSO!')
                .setDescription(`Papo reto, a polícia comeu poeira! O <@${robberyData.robberId}> estourou o caixa e meteu o pé.\n\n💰 **Lucro Limpo:** $${robberyData.loot.toLocaleString('pt-BR')} pra conta do crime!`)
                .setColor('#00FF66');

            await assaltoMsg.edit({ content: '💸 O crime compensou desta vez!', embeds: [embedSucesso], components: [] }).catch(()=>{});

        }, 120000); // 120.000 ms = 2 minutos
    }
};