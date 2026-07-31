import { MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    customId: 'seq_action',
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        // ['seq', 'action', 'pagar'|'rota']
        const acao = parts[2];
        const msgId = interaction.message.id;

        const data = global.activeSequestro?.get(msgId);
        if (!data) {
            return interaction.reply({ content: '⏳ Esse sequestro já foi resolvido!', flags: [MessageFlags.Ephemeral] });
        }

        // Só a vítima decide o desenrolo
        if (interaction.user.id !== data.targetId) {
            return interaction.reply({ content: '🔒 Só o sequestrado pode decidir o desenrolo!', flags: [MessageFlags.Ephemeral] });
        }

        const { kidId, targetId, resgate } = data;

        try {
            await interaction.deferUpdate().catch(() => {});

            const checkTarget = await prisma.user.findUnique({ where: { userId: targetId } });

            if (acao === 'pagar') {
                if (!checkTarget || checkTarget.balance < resgate) {
                    global.activeSequestro.delete(msgId);
                    return interaction.editReply({ content: '🤡 A vítima tentou pagar, mas a carteira tá vazia! O sequestrador soltou ela com uma coça.', embeds: [], components: [] });
                }

                await prisma.$transaction([
                    prisma.user.update({ where: { userId: targetId }, data: { balance: { decrement: resgate } } }),
                    prisma.user.update({ where: { userId: kidId }, data: { balance: { increment: resgate } } })
                ]);

                global.activeSequestro.delete(msgId);
                return interaction.editReply({
                    content: `💸 **RESGATE PAGO!**\n\nO <@${targetId}> desembolsou **$${resgate.toLocaleString('pt-BR')}** e foi solto na porta do baile, mais aliviado que arrombado!\n\n💰 O sequestrador <@${kidId}> saiu sorrindo com a grana. O crime compensou.`,
                    embeds: [],
                    components: []
                });
            }

            // ---------- CHAMOU A ROTA ----------
            const chance = Math.random() * 100;

            if (chance <= 50) {
                // A ROTA PEGOU O SEQUESTRADOR
                const jailTime = new Date(Date.now() + 60 * 60 * 1000);
                await prisma.cooldown.upsert({
                    where: { userId_command: { userId: kidId, command: 'preso' } },
                    update: { expiresAt: jailTime },
                    create: { userId: kidId, command: 'preso', expiresAt: jailTime }
                });

                global.activeSequestro.delete(msgId);
                return interaction.editReply({
                    content: `🚨 **ROTA NO LOCAL! ENQUADRO CERTO!**\n\nO <@${targetId}> chamou o 190 e a ROTA veio voando! Cercaram o cativeiro, derrubaram a porta na voadora e prenderam o <@${kidId}> no ato!\n\n🔒 O sequestrador vai passar **1 HORA** em Alcatraz e saiu de mãos abanando.`,
                    embeds: [],
                    components: []
                });
            }

            // SEQUESTRADOR FUGIU
            global.activeSequestro.delete(msgId);
            return interaction.editReply({
                content: `💨 **O SEQUESTRADOR FUGIU!**\n\nA ROTA chegou, mas o <@${kidId}> já tinha metido o pé pelos fundos com o refém! Depois de 20 quarteirões correndo atrás, o sequestrador largou o <@${targetId}> num beco e evaporou.\n\nNinguém levou a grana, mas o cativeiro acabou. A polícia foi pro cafezinho.`,
                embeds: [],
                components: []
            });
        } catch (error) {
            console.error(`[CRASH SEQUESTRO] ${interaction.user.id}:`, error);
            return interaction.editReply({ content: '❌ Erro interno ao resolver o sequestro. Tenta de novo, chefe!', embeds: [], components: [] }).catch(() => {});
        }
    }
};
