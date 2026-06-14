import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { createEmbed } from '../../../utils/embedBuilder.js';
import { gerarCanvasAssalto } from '../../../utils/canvasAssalto.js';

if (!global.activeRobberies) global.activeRobberies = new Map();

export default {
    name: 'assaltar_caixa',
    execute: async (message) => {
        const userId = message.author.id;
        const guildId = message.guild.id;

        const userDb = await prisma.user.findUnique({ where: { userId } });
        if (!userDb || userDb.currentJob !== 'ladrao') {
            return message.reply('❌ Você não tem a manha do crime, chefe. Só quem é `Ladrão` de carteira assinada estoura caixa!');
        }

        const cooldownDb = await prisma.cooldown.findUnique({ where: { userId_command: { userId, command: 'assaltar_caixa' } } });
        if (cooldownDb && cooldownDb.expiresAt > new Date()) {
            const minutos = Math.ceil((cooldownDb.expiresAt - new Date()) / 60000);
            return message.reply(`⏳ A poeira ainda não baixou da última explosão! Fica na miúda por mais **${minutos} minutos**.`);
        }

        const nextTime = new Date(Date.now() + 60 * 60 * 1000);
        await prisma.cooldown.upsert({
            where: { userId_command: { userId, command: 'assaltar_caixa' } },
            update: { expiresAt: nextTime },
            create: { userId, command: 'assaltar_caixa', expiresAt: nextTime }
        });

        const lucro = Math.floor(Math.random() * (150000 - 50000 + 1)) + 50000;

        // Variações para nunca ser o mesmo texto de início
        const inicios = [
            `O bagulho ficou doido! O <@${userId}> meteu a furadeira no Caixa Eletrônico da Koda Tech!`,
            `Visão, rapaziada! O <@${userId}> amarrou o cabo de aço no caixa e tá acelerando a caminhonete!`,
            `Chama o BOPE! O <@${userId}> colou C4 no caixa eletrônico e tá com o detonador na mão!`,
            `O cara tá de maçarico no meio da rua! O <@${userId}> tá derretendo o cofre do banco!`,
            `Ousadia pura! O <@${userId}> hackeou o sistema do caixa eletrônico e ele tá cuspindo nota!`
        ];
        const historiaInicio = inicios[Math.floor(Math.random() * inicios.length)];

        // Geração do CANVAS lindão
        const avatarUrl = message.author.displayAvatarURL({ extension: 'png', size: 256 });
        const canvasBuffer = await gerarCanvasAssalto(avatarUrl, 'andamento', lucro);
        const attachment = new AttachmentBuilder(canvasBuffer, { name: 'assalto.png' });

        // Usando o seu EmbedBuilder interno (Flag V2)
        const embed = createEmbed({
            title: '🚨 ALERTA 190: O CRIME TÁ ROLANDO!',
            description: `${historiaInicio}\n\n**🚓 A Polícia tem 2 MINUTOS pra chegar na cena e impedir o crime!**`,
            color: '#FF8C00'
        });
        embed.setImage('attachment://assalto.png');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('assalto_intervir')
                .setLabel('🚓 IMPEDIR ASSALTO')
                .setStyle(ButtonStyle.Danger)
        );

        const assaltoMsg = await message.channel.send({ content: '@here 🚨 **Atenção Unidades!**', embeds: [embed], files: [attachment], components: [row] });

        global.activeRobberies.set(assaltoMsg.id, {
            robberId: userId,
            guildId: guildId,
            loot: lucro,
            avatarUrl: avatarUrl
        });

        // Temporizador do Ladrão Ganhando
        setTimeout(async () => {
            const robberyData = global.activeRobberies.get(assaltoMsg.id);
            if (!robberyData) return;

            global.activeRobberies.delete(assaltoMsg.id);

            await prisma.user.update({
                where: { userId: robberyData.robberId },
                data: { balance: { increment: robberyData.loot } }
            });

            // Geração do Canvas de Fuga (Verde)
            const canvasFugaBuffer = await gerarCanvasAssalto(robberyData.avatarUrl, 'fuga', robberyData.loot);
            const attachmentFuga = new AttachmentBuilder(canvasFugaBuffer, { name: 'fuga.png' });

            const embedFuga = createEmbed({
                title: '💥 CAIXA ESTOURADO COM SUCESSO!',
                description: `Papo reto, a polícia comeu poeira! O <@${robberyData.robberId}> meteu o pé.\n\n💰 **Lucro Limpo:** $${robberyData.loot.toLocaleString('pt-BR')} pra conta do crime!`,
                color: '#00FF66'
            });
            embedFuga.setImage('attachment://fuga.png');

            await assaltoMsg.edit({ content: '💸 O crime compensou desta vez!', embeds: [embedFuga], files: [attachmentFuga], components: [] }).catch(()=>{});
        }, 120000);
    }
};