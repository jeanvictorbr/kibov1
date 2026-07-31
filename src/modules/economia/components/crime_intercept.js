import { MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';

// Configuração dos crimes que usam esse botão de interceptação
const CRIMES = {
    registradora: {
        recompensa: 15000,
        prenderMsg: (criminalId, copId, sujoSeized) =>
            `🚨 **BANDIDO DETIDO NO CAIXA!**\n\nO Oficial <@${copId}> chegou de viatura e agarrou o <@${criminalId}> com a mão ainda na sacola de dinheiro da registradora!\n\n🔒 O meliante pegou **1 HORA** de Alcatraz e a grana virou evidência!\n💰 O Oficial faturou **$15.000** por bravura.${sujoSeized}`,
        fugirMsg: (criminalId, copId) =>
            `💨 **O MELIANTE FUGIU!**\n\nO Oficial <@${copId}> correu atrás do <@${criminalId}> pela avenida inteira, mas o cara conhecia cada beco da zona leste e sumiu!\n\n🚑 O Oficial voltou arrebentado e fica **10 minutos** fora de combate.`
    },
    arrastao: {
        recompensa: 25000,
        prenderMsg: (criminalId, copId, sujoSeized) =>
            `🚨 **ARRASTÃO ENCERRADO NA BASE DO CASSETETE!**\n\nO Oficial <@${copId}> cercou o <@${criminalId}> com a multidão recuperando os pertences na mão grande!\n\n🔒 O meliante pegou **1 HORA** de Alcatraz e o butim virou evidência!\n💰 O Oficial faturou **$25.000** por bravura.${sujoSeized}`,
        fugirMsg: (criminalId, copId) =>
            `💨 **O ARRASTÃO SUMIU NO POVO!**\n\nO Oficial <@${copId}> tentou fechar o cerco, mas o <@${criminalId}> se misturou com a multidão e evaporou!\n\n🚑 O Oficial voltou arrebentado e fica **10 minutos** fora de combate.`
    }
};

export default {
    customId: 'crime_intercept',
    execute: async (interaction) => {
        const msgId = interaction.message.id;

        const data = global.activeCrimes?.get(msgId);
        if (!data) {
            return interaction.reply({ content: '⏳ Tarde demais! O meliante já deu o fora da área.', flags: [MessageFlags.Ephemeral] });
        }

        const copId = interaction.user.id;
        const { criminalId, guildId, tipo } = data;
        const cfg = CRIMES[tipo] || CRIMES.registradora;

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
        if (copId === criminalId) {
            return interaction.reply({ content: '🤨 Se auto-denunciar? Tá chapando, chefe.', flags: [MessageFlags.Ephemeral] });
        }

        // O primeiro PM válido resolve a operação
        global.activeCrimes.delete(msgId);

        try {
            await interaction.deferUpdate().catch(() => {});

            const troco = Math.random() * 100;
            if (troco <= 50) {
                // 🚨 PM prendeu o meliante
                const jailTime = new Date(Date.now() + 60 * 60 * 1000);
                await prisma.cooldown.upsert({
                    where: { userId_command: { userId: criminalId, command: 'preso' } },
                    update: { expiresAt: jailTime },
                    create: { userId: criminalId, command: 'preso', expiresAt: jailTime }
                });
                await prisma.user.update({ where: { userId: copId }, data: { balance: { increment: cfg.recompensa } } });

                // 🧼 Apreende 50% da grana suja do meliante
                const crimDb = await prisma.user.findUnique({ where: { userId: criminalId } });
                const sujoSeized = Math.floor((crimDb?.dirtyMoney || 0) * 0.5);
                if (sujoSeized > 0) {
                    await prisma.user.update({ where: { userId: criminalId }, data: { dirtyMoney: { decrement: sujoSeized } } });
                }

                const sujoMsg = sujoSeized > 0 ? `\n🧼 **Grana suja:** $${sujoSeized.toLocaleString('pt-BR')} apreendida como evidência!` : '';
                return interaction.editReply({
                    content: cfg.prenderMsg(criminalId, copId, sujoMsg),
                    components: []
                });
            }

            // 💨 Meliante fugiu, PM se cansou
            await prisma.cooldown.upsert({
                where: { userId_command: { userId: copId, command: 'cansaco_cf' } },
                update: { expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
                create: { userId: copId, command: 'cansaco_cf', expiresAt: new Date(Date.now() + 10 * 60 * 1000) }
            });
            return interaction.editReply({
                content: cfg.fugirMsg(criminalId, copId),
                components: []
            });
        } catch (error) {
            console.error(`[CRASH INTERCEPTAÇÃO] ${copId}:`, error);
            return interaction.editReply({ content: '❌ Erro interno na interceptação. Tenta de novo, chefe!', components: [] }).catch(() => {});
        }
    }
};
