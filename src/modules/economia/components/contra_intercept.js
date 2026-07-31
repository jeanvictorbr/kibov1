import { MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    customId: 'contra_intercept',
    execute: async (interaction) => {
        const msgId = interaction.message.id;

        const data = global.activeContrabando?.get(msgId);
        if (!data) {
            return interaction.reply({ content: '⏳ Tarde demais! O contrabandista já sumiu no mato.', flags: [MessageFlags.Ephemeral] });
        }

        const copId = interaction.user.id;
        const { smugglerId, guildId } = data;

        // Só PM com distintivo nessa cidade pode interceptar
        const copDb = await prisma.user.findUnique({ where: { userId: copId } });
        if (!copDb || copDb.currentJob !== 'policial') {
            return interaction.reply({ content: '🛑 Sai da frente, paisano! Isso é trampo da Polícia.', flags: [MessageFlags.Ephemeral] });
        }
        const hasBadge = await prisma.policeBadge.findUnique({
            where: { userId_guildId: { userId: copId, guildId } }
        });
        if (!hasBadge) {
            return interaction.reply({ content: '🛑 Cê não tem distintivo dessa cidade pra participar da operação.', flags: [MessageFlags.Ephemeral] });
        }
        if (copId === smugglerId) {
            return interaction.reply({ content: '🤨 Se auto-denunciar? Tá chapando, chefe.', flags: [MessageFlags.Ephemeral] });
        }

        // O primeiro PM válido resolve a operação
        global.activeContrabando.delete(msgId);

        try {
            await interaction.deferUpdate().catch(() => {});

            const troco = Math.random() * 100;
            if (troco <= 50) {
                // 🚨 PM pegou o contrabandista
                const jailTime = new Date(Date.now() + 60 * 60 * 1000);
                await prisma.cooldown.upsert({
                    where: { userId_command: { userId: smugglerId, command: 'preso' } },
                    update: { expiresAt: jailTime },
                    create: { userId: smugglerId, command: 'preso', expiresAt: jailTime }
                });
                await prisma.user.update({ where: { userId: copId }, data: { balance: { increment: 15000 } } });

                // 🧼 Apreende 50% da grana suja do contrabandista
                const contrabDb = await prisma.user.findUnique({ where: { userId: smugglerId } });
                const sujoSeized = Math.floor((contrabDb?.dirtyMoney || 0) * 0.5);
                if (sujoSeized > 0) {
                    await prisma.user.update({ where: { userId: smugglerId }, data: { dirtyMoney: { decrement: sujoSeized } } });
                }

                const sujoMsg = sujoSeized > 0 ? `\n🧼 **Grana suja:** $${sujoSeized.toLocaleString('pt-BR')} apreendida como evidência!` : '';
                return interaction.editReply({
                    content: `🚨 **INTERCEPTADO NO MATO!**\n\nO Oficial <@${copId}> chegou de viatura gritando no rádio e pegou o <@${smugglerId}> enfiado no meio da vegetação, segurando a caixa vazia!\n\n🔒 O contrabandista pegou **1 HORA** de Alcatraz e a mercadoria virou evidência!\n💰 O Oficial faturou **$15.000** por bravura.${sujoMsg}`,
                    components: []
                });
            }

            // 💨 Contrabandista fugiu, PM se cansou
            await prisma.cooldown.upsert({
                where: { userId_command: { userId: copId, command: 'cansaco_cf' } },
                update: { expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
                create: { userId: copId, command: 'cansaco_cf', expiresAt: new Date(Date.now() + 10 * 60 * 1000) }
            });
            return interaction.editReply({
                content: `💨 **O CONTRABANDISTA FUGIU!**\n\nO Oficial <@${copId}> correu 20 quarteirões atrás do <@${smugglerId}>, mas o cara conhecia o mato como ninguém e sumiu!\n\n🚑 O Oficial voltou arrebentado e fica **10 minutos** fora de combate.`,
                components: []
            });
        } catch (error) {
            console.error(`[CRASH CONTRABANDO] ${copId}:`, error);
            return interaction.editReply({ content: '❌ Erro interno na interceptação. Tenta de novo, chefe!', components: [] }).catch(() => {});
        }
    }
};
