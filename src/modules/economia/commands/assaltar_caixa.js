import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { gerarCanvasAssalto } from '../../../utils/canvasAssalto.js';

if (!global.activeRobberies) global.activeRobberies = new Map();

// 👑 SEU ID AQUI (Sem cooldown)
const DEV_ID = 'SEU_ID_AQUI'; 

export default {
    name: 'assaltar_caixa',
    execute: async (message) => {
        const userId = message.author.id;
        const guildId = message.guild.id;

        const userDb = await prisma.user.findUnique({ where: { userId } });
        
        const semProfissaoMsgs = [
            '❌ Você não tem a manha do crime, chefe. Só quem é `Ladrão` de carteira assinada sabe estourar um caixa!',
            '❌ Sai fora, paisano! Esse trampo é só pra quem é `Ladrão` treinado no submundo.',
            '❌ Tá achando que a vida é um morango? Dá um pulo no `k trabalhar` e vira Ladrão primeiro!',
            '❌ Você não sabe nem ligar um maçarico, chefe. Deixa o assalto pra quem é da profissão.'
        ];

        if (!userDb || userDb.currentJob !== 'ladrao') {
            return message.reply(semProfissaoMsgs[Math.floor(Math.random() * semProfissaoMsgs.length)]);
        }

        const isDev = userId === DEV_ID;
        const isVip = userDb.isPremium;
        const cooldownMinutes = isVip ? 5 : 20; 
        const cooldownMs = cooldownMinutes * 60 * 1000;

        if (!isDev) {
            const cooldownDb = await prisma.cooldown.findUnique({ where: { userId_command: { userId, command: 'assaltar_caixa' } } });
            
            if (cooldownDb && cooldownDb.expiresAt > new Date()) {
                const minutos = Math.ceil((cooldownDb.expiresAt - new Date()) / 60000);
                
                const cooldownMsgs = [
                    `⏳ A poeira ainda não baixou da última explosão! Fica na miúda por mais **${minutos} minutos** pra polícia não te rastrear.`,
                    `⏳ Calma aí, Zé Pequeno! A ROTA ainda tá patrulhando a área. Esconde as ferramentas por **${minutos} minutos**.`,
                    `⏳ O alarme do último caixa ainda tá tocando na quebrada! Segura a emoção aí por **${minutos} minutos**.`,
                    `⏳ Tá querendo ir pra Alcatraz mais cedo? Os PMs tão na rua, mofa mais **${minutos} minutos** no esconderijo antes de agir.`
                ];
                
                return message.reply(cooldownMsgs[Math.floor(Math.random() * cooldownMsgs.length)]);
            }

            const nextTime = new Date(Date.now() + cooldownMs);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId, command: 'assaltar_caixa' } },
                update: { expiresAt: nextTime },
                create: { userId, command: 'assaltar_caixa', expiresAt: nextTime }
            });
        }

        const lucro = Math.floor(Math.random() * (150000 - 50000 + 1)) + 50000;

        const inicios = [
            `O bagulho ficou doido! O <@${userId}> meteu a furadeira no Caixa Eletrônico da Koda Tech!`,
            `Visão, rapaziada! O <@${userId}> amarrou o cabo de aço no caixa e tá acelerando a caminhonete!`,
            `Chama o BOPE! O <@${userId}> colou C4 no caixa eletrônico e tá com o detonador na mão!`,
            `O cara tá de maçarico no meio da rua! O <@${userId}> tá derretendo o cofre do banco!`,
            `Ousadia pura! O <@${userId}> hackeou o sistema do caixa eletrônico e ele tá cuspindo nota!`
        ];
        const historiaInicio = inicios[Math.floor(Math.random() * inicios.length)];

        const avatarUrl = message.author.displayAvatarURL({ extension: 'png', size: 256 });
        const canvasBuffer = await gerarCanvasAssalto(avatarUrl, 'andamento', lucro);
        const attachment = new AttachmentBuilder(canvasBuffer, { name: 'assalto.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('assalto_intervir')
                .setLabel('🚓 IMPEDIR ASSALTO')
                .setStyle(ButtonStyle.Danger)
        );

        // MENSAGEM PURA, SEM EMBED
        const textoChat = `🚨 **ALERTA 190: O CRIME TÁ ROLANDO!**\n\n${historiaInicio}\n\n**🚓 A Polícia tem 2 MINUTOS pra chegar na cena e impedir o crime!**\n@here`;

        const assaltoMsg = await message.channel.send({ content: textoChat, files: [attachment], components: [row] });

        global.activeRobberies.set(assaltoMsg.id, {
            robberId: userId,
            guildId: guildId,
            loot: lucro,
            avatarUrl: avatarUrl
        });

        setTimeout(async () => {
            const robberyData = global.activeRobberies.get(assaltoMsg.id);
            if (!robberyData) return; 

            global.activeRobberies.delete(assaltoMsg.id);

            await prisma.user.update({
                where: { userId: robberyData.robberId },
                data: { balance: { increment: robberyData.loot } }
            });

            const sucessos = [
                `Papo reto, a polícia comeu poeira! O <@${robberyData.robberId}> meteu o pé com a grana.`,
                `A ROTA atrasou e o crime compensou! O <@${robberyData.robberId}> limpou o caixa sem deixar rastros.`,
                `Trabalho de profissional! O <@${robberyData.robberId}> não deixou nem digital pro PM cheirar.`
            ];
            const historiaSucesso = sucessos[Math.floor(Math.random() * sucessos.length)];

            const canvasFugaBuffer = await gerarCanvasAssalto(robberyData.avatarUrl, 'fuga', robberyData.loot);
            const attachmentFuga = new AttachmentBuilder(canvasFugaBuffer, { name: 'fuga.png' });

            // MENSAGEM PURA
            const textoFuga = `💥 **CAIXA ESTOURADO COM SUCESSO!**\n\n${historiaSucesso}\n💰 **Lucro Limpo:** $${robberyData.loot.toLocaleString('pt-BR')} pra conta do crime!`;

            await assaltoMsg.edit({ content: textoFuga, files: [attachmentFuga], components: [] }).catch(()=>{});
        }, 120000);
    }
};