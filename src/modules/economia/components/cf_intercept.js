import { MessageFlags, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { gerarCanvasCarroForte } from '../../../utils/canvasCarroForte.js';

export default {
    customId: 'cf_intercept',
    execute: async (interaction) => {
        const copId = interaction.user.id;
        const msgId = interaction.message.id;

        const data = global.activeCarroForte.get(msgId);
        if (!data) return interaction.reply({ content: '❌ Tarde demais! O blindado já tá vazio.', flags: [MessageFlags.Ephemeral] });

        const copDb = await prisma.user.findUnique({ where: { userId: copId } });
        if (!copDb || copDb.currentJob !== 'policial') {
            return interaction.reply({ content: '🛑 Sai da frente! Área de risco, isolamento da polícia!', flags: [MessageFlags.Ephemeral] });
        }

        const hasBadge = await prisma.policeBadge.findUnique({ where: { userId_guildId: { userId: copId, guildId: data.guildId } } });
        if (!hasBadge) {
            return interaction.reply({ content: '🛑 Cê não tem distintivo dessa cidade pra entrar nessa operação pesada.', flags: [MessageFlags.Ephemeral] });
        }

        // Verifica se o PM tá de cooldown do último tiro que tomou
        const copCooldown = await prisma.cooldown.findUnique({ where: { userId_command: { userId: copId, command: 'cansaco_cf' } } });
        if (copCooldown && copCooldown.expiresAt > new Date()) {
            return interaction.reply({ content: '🚑 Você tomou um tiro de raspão agora pouco! Espera os paramédicos te curarem antes de voltar pro combate.', flags: [MessageFlags.Ephemeral] });
        }

        if (data.crew.includes(copId)) {
            return interaction.reply({ content: '🤨 Cê tá no bonde dos ladrões e quer prender os caras? Vira-casaca não tem vez!', flags: [MessageFlags.Ephemeral] });
        }

        if (data.crew.length === 0) {
            return interaction.reply({ content: '🔍 A área tá limpa, não tem mais nenhum bandido em pé!', flags: [MessageFlags.Ephemeral] });
        }

        // Sorteia UM ladrão do bonde pra trocar tiro
        const targetThiefId = data.crew[Math.floor(Math.random() * data.crew.length)];
        const chance = Math.random() * 100;

        if (chance <= 50) {
            // PM GANHOU O X1
            
            // Ladrão pega 2 HORAS DE CADEIA (Pena Máxima)
            const jailTime = new Date(Date.now() + 120 * 60 * 1000);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId: targetThiefId, command: 'preso' } },
                update: { expiresAt: jailTime },
                create: { userId: targetThiefId, command: 'preso', expiresAt: jailTime }
            });

            // Tira o ladrão abatido do bonde
            data.crew = data.crew.filter(id => id !== targetThiefId);

            // Recompensa de Bravura pro PM ($15k)
            await prisma.user.update({ where: { userId: copId }, data: { balance: { increment: 15000 } } });

            // Killfeed público no chat!
            await interaction.reply({ content: `💥 **TIROTEIO!** O Oficial <@${copId}> flanqueou a van, deu um tiro de 12 no peito do <@${targetThiefId}> e mandou ele pra Alcatraz por **2 HORAS**!\n*(O Oficial ganhou $15.000 por bravura)*` });

            // SE MATOU O ÚLTIMO LADRÃO: A PM GANHOU O EVENTO
            if (data.crew.length === 0) {
                clearInterval(data.intervalId);
                global.activeCarroForte.delete(msgId);

                const canvasFalha = await gerarCanvasCarroForte(data.avatarUrl, 'falha');
                const attFalha = new AttachmentBuilder(canvasFalha, { name: 'cf.png' });

                await interaction.message.edit({ content: `🚓 **OPERAÇÃO CONCLUÍDA!**\n\nA ROTA neutralizou todo o bonde! Os malotes do Carro Forte tão seguros e os bandidos tão a caminho do presídio de segurança máxima.`, files: [attFalha], components: [] }).catch(()=>{});
            }

        } else {
            // LADRÃO GANHOU O X1 (O Ladrão não ganha dinheiro aqui, ele defende o carro!)
            
            // PM toma bala e pega 10 min de cooldown
            const cansacoTime = new Date(Date.now() + 10 * 60 * 1000);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId: copId, command: 'cansaco_cf' } },
                update: { expiresAt: cansacoTime },
                create: { userId: copId, command: 'cansaco_cf', expiresAt: cansacoTime }
            });

            await interaction.reply({ content: `💥 **TIROTEIO!** O Oficial <@${copId}> tentou avançar no blindado, mas o <@${targetThiefId}> botou a cara de AK-47 e cravou bala na viatura!\n*(O Oficial recuou ferido e ficará 10 minutos fora de combate)*` });
        }
    }
};