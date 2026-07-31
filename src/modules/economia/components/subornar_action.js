import { EmbedBuilder, MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    customId: 'subornar_action',
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        // ['subornar', 'action', 'aceitar'|'recusar']
        const acao = parts[2];
        const msgId = interaction.message.id;

        const data = global.activeSuborno?.get(msgId);
        if (!data) {
            return interaction.reply({ content: '⏳ Esse desenrolo já expirou! O carcereiro chefe passou no corredor.', flags: [MessageFlags.Ephemeral] });
        }

        // Só o PM chamado pode decidir
        if (interaction.user.id !== data.copId) {
            return interaction.reply({ content: '🔒 Só o Oficial chamado pode decidir esse desenrolo!', flags: [MessageFlags.Ephemeral] });
        }

        const { robberId, copId, bribeAmount } = data;

        try {
            await interaction.deferUpdate().catch(() => {});

            const checkRobber = await prisma.user.findUnique({ where: { userId: robberId } });
            const checkJail = await prisma.cooldown.findUnique({ where: { userId_command: { userId: robberId, command: 'preso' } } });

            if (!checkJail || checkJail.expiresAt < new Date()) {
                global.activeSuborno.delete(msgId);
                return interaction.editReply({ content: '⏳ Tarde demais! O cara já fugiu ou a pena acabou.', embeds: [], components: [] });
            }
            if (!checkRobber || checkRobber.balance < bribeAmount) {
                global.activeSuborno.delete(msgId);
                return interaction.editReply({ content: '🤡 O vagabundo tentou dar o calote! Prometeu a grana mas a carteira tá vazia. Negócio cancelado!', embeds: [], components: [] });
            }

            if (acao === 'aceitar') {
                // CORRUPÇÃO CONCLUÍDA
                await prisma.$transaction([
                    prisma.user.update({ where: { userId: robberId }, data: { balance: { decrement: bribeAmount } } }),
                    prisma.user.update({ where: { userId: copId }, data: { balance: { increment: bribeAmount } } }),
                    prisma.cooldown.delete({ where: { userId_command: { userId: robberId, command: 'preso' } } })
                ]);

                const embedAceitou = new EmbedBuilder()
                    .setTitle('🤝 NEGÓCIO FECHADO!')
                    .setDescription(`O Oficial <@${copId}> olhou pros dois lados, guardou os **$${bribeAmount.toLocaleString('pt-BR')}** na bota e destrancou a porta.\n\n🔓 O <@${robberId}> tá solto na rua de novo! O sistema é sujo!`)
                    .setColor('#00FF00');

                global.activeSuborno.delete(msgId);
                return interaction.editReply({ content: '💸 Fechou no sigilo.', embeds: [embedAceitou], components: [] });
            }

            // RECUSOU (sorteia punição de 2 a 8 minutos)
            const penaExtra = Math.floor(Math.random() * (8 - 2 + 1)) + 2;
            const novaPena = new Date(checkJail.expiresAt.getTime() + penaExtra * 60 * 1000);
            await prisma.cooldown.update({
                where: { userId_command: { userId: robberId, command: 'preso' } },
                data: { expiresAt: novaPena }
            });

            const embedRecusou = new EmbedBuilder()
                .setTitle('🛑 PM INCORRUPTÍVEL!')
                .setDescription(`O Oficial <@${copId}> deu risada da cara do <@${robberId}>, recusou a grana e bateu com o cacetete na grade!\n\n⚖️ **Punição:** O juiz sorteou mais **+${penaExtra} Minutos** na pena por tentativa de suborno!`)
                .setColor('#FF0000');

            global.activeSuborno.delete(msgId);
            return interaction.editReply({ content: '👮 A lei não tá à venda, chefe!', embeds: [embedRecusou], components: [] });
        } catch (error) {
            console.error(`[CRASH SUBORNO] ${interaction.user.id}:`, error);
            return interaction.editReply({ content: '❌ Erro interno ao processar o desenrolo. Tenta de novo, chefe!', embeds: [], components: [] }).catch(() => {});
        }
    }
};
