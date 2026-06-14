import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { gerarCanvasCarroForte } from '../../../utils/canvasCarroForte.js';

if (!global.activeCarroForte) global.activeCarroForte = new Map();

// 👑 SEU ID DE DEV AQUI (Sem cooldown)
const DEV_ID = 'SEU_ID_AQUI'; 

export default {
    name: 'carroforte',
    execute: async (message) => {
        const userId = message.author.id;
        const guildId = message.guild.id;

        const userDb = await prisma.user.findUnique({ where: { userId } });
        
        if (!userDb || userDb.currentJob !== 'ladrao') {
            return message.reply('❌ Você tá de brincadeira? Roubar Carro Forte é trampo pra `Ladrão` de alta periculosidade!');
        }

        // COOLDOWN: 30m Normal, 5m VIP, 0m DEV
        const isDev = userId === DEV_ID;
        const isVip = userDb.isPremium;
        const cooldownMinutes = isVip ? 5 : 30; 
        const cooldownMs = cooldownMinutes * 60 * 1000;

        if (!isDev) {
            const cooldownDb = await prisma.cooldown.findUnique({ where: { userId_command: { userId, command: 'carroforte' } } });
            if (cooldownDb && cooldownDb.expiresAt > new Date()) {
                const minutos = Math.ceil((cooldownDb.expiresAt - new Date()) / 60000);
                return message.reply(`⏳ A Tropa de Choque ainda tá na rua caçando sua cabeça! Fica entocado por mais **${minutos} minutos**.`);
            }

            const nextTime = new Date(Date.now() + cooldownMs);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId, command: 'carroforte' } },
                update: { expiresAt: nextTime },
                create: { userId, command: 'carroforte', expiresAt: nextTime }
            });
        }

        const avatarUrl = message.author.displayAvatarURL({ extension: 'png', size: 256 });
        const canvasBuffer = await gerarCanvasCarroForte(avatarUrl, 'inicio');
        const attachment = new AttachmentBuilder(canvasBuffer, { name: 'cf.png' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('cf_join')
                .setLabel('🥷 ENTRAR NO BONDE')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('cf_intercept')
                .setLabel('🚓 INTERCEPTAR')
                .setStyle(ButtonStyle.Danger)
        );

        const textoInicial = `🚨 **ALERTA MÁXIMO: CARRO FORTE DA BRINK'S SOB ATAQUE!**\n\nO louco do <@${userId}> jogou uma van na frente do blindado na rodovia principal e colou C4 nas portas!\n\n**O cofre abre em 3 MINUTOS!**\nLadrões, entrem no bonde pra dar cobertura! Polícia, interceptem agora!\n@here`;

        const msg = await message.channel.send({ content: textoInicial, files: [attachment], components: [row] });

        // Registra o evento globalmente
        global.activeCarroForte.set(msg.id, {
            leaderId: userId,
            guildId: guildId,
            crew: [userId], // O líder já tá no bonde
            avatarUrl: avatarUrl,
            intervalId: null
        });

        // O Relógio do Caos
        let minuto = 0;
        const loop = setInterval(async () => {
            const data = global.activeCarroForte.get(msg.id);
            if (!data) return clearInterval(loop); // PM encerrou o evento

            minuto++;

            if (minuto === 1) {
                // FASE 1
                const hist = [
                    "🔥 O maçarico pifou! Os caras tão metendo bala na fechadura pra tentar abrir! A rua tá um caos!",
                    "🚁 Tem helicóptero de reportagem filmando tudo! Os guardas do carro forte tão trancados lá dentro pedindo socorro no rádio!"
                ];
                const canvasF1 = await gerarCanvasCarroForte(avatarUrl, 'min1');
                const attF1 = new AttachmentBuilder(canvasF1, { name: 'cf.png' });
                await msg.edit({ content: `🚨 **ATUALIZAÇÃO (Falta 2 Minutos):**\n${hist[Math.floor(Math.random() * hist.length)]}`, files: [attF1] }).catch(()=>{});
            
            } else if (minuto === 2) {
                // FASE 2
                const hist = [
                    "💥 Os guardas abriram uma fresta e tão atirando de lá de dentro! O bonde tá trocando tiro pesado!",
                    "⏳ O pavio da C4 foi aceso! O cofre tá começando a derreter. Falta muito pouco!"
                ];
                const canvasF2 = await gerarCanvasCarroForte(avatarUrl, 'min2');
                const attF2 = new AttachmentBuilder(canvasF2, { name: 'cf.png' });
                await msg.edit({ content: `🚨 **ATUALIZAÇÃO CRÍTICA (Falta 1 Minuto):**\n${hist[Math.floor(Math.random() * hist.length)]}`, files: [attF2] }).catch(()=>{});
            
            } else if (minuto === 3) {
                // FASE FINAL: O Cofre Abre
                clearInterval(loop);
                global.activeCarroForte.delete(msg.id);

                // Sorteia de 500k a 1.5 Milhão
                const lootTotal = Math.floor(Math.random() * (1500000 - 500000 + 1)) + 500000;
                const lootPorPessoa = Math.floor(lootTotal / data.crew.length);

                // Paga todos os sobreviventes
                for (const memberId of data.crew) {
                    await prisma.user.update({
                        where: { userId: memberId },
                        data: { balance: { increment: lootPorPessoa } }
                    });
                }

                const canvasSuc = await gerarCanvasCarroForte(avatarUrl, 'sucesso');
                const attSuc = new AttachmentBuilder(canvasSuc, { name: 'cf.png' });
                
                let mensoes = data.crew.map(id => `<@${id}>`).join(', ');
                const textoFinal = `💰 **BOOOM! A PORTA VOOU A 50 METROS!**\n\nA polícia comeu poeira! O bonde invadiu o blindado e limpou as prateleiras de dinheiro!\n\n💸 **Loot Total:** $${lootTotal.toLocaleString('pt-BR')}\n🔥 **Sobreviventes:** ${mensoes}\n*(Cada um levou $${lootPorPessoa.toLocaleString('pt-BR')} pra casa!)*`;

                await msg.edit({ content: textoFinal, files: [attSuc], components: [] }).catch(()=>{});
            }
        }, 60000); // Roda a cada 60 segundos

        // Salva o ID do loop pra gente poder cancelar se a PM matar todo mundo
        global.activeCarroForte.get(msg.id).intervalId = loop;
    }
};