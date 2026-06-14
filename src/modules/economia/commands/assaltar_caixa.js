import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { createEmbed } from '../../../utils/embedBuilder.js';
import { gerarCanvasAssalto } from '../../../utils/canvasAssalto.js';

if (!global.activeRobberies) global.activeRobberies = new Map();

// 👑 COLOQUE O SEU ID DO DISCORD AQUI (Você não terá cooldown nenhum)
const DEV_ID = '1070658145740926987'; 

export default {
    name: 'assaltar_caixa',
    execute: async (message) => {
        const userId = message.author.id;
        const guildId = message.guild.id;

        const userDb = await prisma.user.findUnique({ where: { userId } });
        
        // --- RESPOSTAS VARIADAS (Bloqueio de Profissão) ---
        const semProfissaoMsgs = [
            '❌ Você não tem a manha do crime, chefe. Só quem é `Ladrão` de carteira assinada sabe estourar um caixa!',
            '❌ Sai fora, paisano! Esse trampo é só pra quem é `Ladrão` treinado no submundo.',
            '❌ Tá achando que a vida é um morango? Dá um pulo no `k trabalhar` e vira Ladrão primeiro!',
            '❌ Você não sabe nem ligar um maçarico, chefe. Deixa o assalto pra quem é da profissão.'
        ];

        if (!userDb || userDb.currentJob !== 'ladrao') {
            return message.reply(semProfissaoMsgs[Math.floor(Math.random() * semProfissaoMsgs.length)]);
        }

        // --- LÓGICA DE COOLDOWN (VIP / NORMAL / DEV) ---
        const isDev = userId === DEV_ID;
        const isVip = userDb.isPremium;
        
        // Se for VIP = 5 mins, Normal = 20 mins
        const cooldownMinutes = isVip ? 5 : 20; 
        const cooldownMs = cooldownMinutes * 60 * 1000;

        if (!isDev) {
            const cooldownDb = await prisma.cooldown.findUnique({ where: { userId_command: { userId, command: 'assaltar_caixa' } } });
            
            if (cooldownDb && cooldownDb.expiresAt > new Date()) {
                const minutos = Math.ceil((cooldownDb.expiresAt - new Date()) / 60000);
                
                // --- RESPOSTAS VARIADAS (Cooldown Ativo) ---
                const cooldownMsgs = [
                    `⏳ A poeira ainda não baixou da última explosão! Fica na miúda por mais **${minutos} minutos** pra polícia não te rastrear.`,
                    `⏳ Calma aí, Zé Pequeno! A ROTA ainda tá patrulhando a área. Esconde as ferramentas por **${minutos} minutos**.`,
                    `⏳ O alarme do último caixa ainda tá tocando na quebrada! Segura a emoção aí por **${minutos} minutos**.`,
                    `⏳ Tá querendo ir pra Alcatraz mais cedo? Os PMs tão na rua, mofa mais **${minutos} minutos** no esconderijo antes de agir.`
                ];
                
                return message.reply(cooldownMsgs[Math.floor(Math.random() * cooldownMsgs.length)]);
            }

            // Aplica o novo cooldown pra quem não é o DEV
            const nextTime = new Date(Date.now() + cooldownMs);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId, command: 'assaltar_caixa' } },
                update: { expiresAt: nextTime },
                create: { userId, command: 'assaltar_caixa', expiresAt: nextTime }
            });
        }

        // --- INÍCIO DO ASSALTO ---
        const lucro = Math.floor(Math.random() * (150000 - 50000 + 1)) + 50000;

        // Variações de história do roubo (Início)
        const inicios = [
            `O bagulho ficou doido! O <@${userId}> meteu a furadeira no Caixa Eletrônico da Koda Tech!`,
            `Visão, rapaziada! O <@${userId}> amarrou o cabo de aço no caixa e tá acelerando a caminhonete!`,
            `Chama o BOPE! O <@${userId}> colou C4 no caixa eletrônico e tá com o detonador na mão!`,
            `O cara tá de maçarico no meio da rua! O <@${userId}> tá derretendo o cofre do banco!`,
            `Ousadia pura! O <@${userId}> hackeou o sistema do caixa eletrônico e ele tá cuspindo nota!`
        ];
        const historiaInicio = inicios[Math.floor(Math.random() * inicios.length)];

        // Geração do CANVAS
        const avatarUrl = message.author.displayAvatarURL({ extension: 'png', size: 256 });
        const canvasBuffer = await gerarCanvasAssalto(avatarUrl, 'andamento', lucro);
        const attachment = new AttachmentBuilder(canvasBuffer, { name: 'assalto.png' });

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

        // Temporizador do Ladrão Ganhando (2 Minutos)
        setTimeout(async () => {
            const robberyData = global.activeRobberies.get(assaltoMsg.id);
            if (!robberyData) return; // PM interveio antes do tempo

            global.activeRobberies.delete(assaltoMsg.id);

            await prisma.user.update({
                where: { userId: robberyData.robberId },
                data: { balance: { increment: robberyData.loot } }
            });

            // Variações de Fuga com Sucesso (Quando a polícia não clica no botão)
            const sucessos = [
                `Papo reto, a polícia comeu poeira! O <@${robberyData.robberId}> meteu o pé com a grana.`,
                `A ROTA atrasou e o crime compensou! O <@${robberyData.robberId}> limpou o caixa sem deixar rastros.`,
                `Trabalho de profissional! O <@${robberyData.robberId}> não deixou nem digital pro PM cheirar.`
            ];
            const historiaSucesso = sucessos[Math.floor(Math.random() * sucessos.length)];

            // Canvas da Fuga Verde
            const canvasFugaBuffer = await gerarCanvasAssalto(robberyData.avatarUrl, 'fuga', robberyData.loot);
            const attachmentFuga = new AttachmentBuilder(canvasFugaBuffer, { name: 'fuga.png' });

            const embedFuga = createEmbed({
                title: '💥 CAIXA ESTOURADO COM SUCESSO!',
                description: `${historiaSucesso}\n\n💰 **Lucro Limpo:** $${robberyData.loot.toLocaleString('pt-BR')} pra conta do crime!`,
                color: '#00FF66'
            });
            embedFuga.setImage('attachment://fuga.png');

            await assaltoMsg.edit({ content: '💸 O crime deitou o cabelo!', embeds: [embedFuga], files: [attachmentFuga], components: [] }).catch(()=>{});
        }, 120000); // 120.000 ms = 2 minutos
    }
};