import { MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { settleWar } from '../../../utils/factionService.js';

const DURACAO_MIN = 60;

export default {
    customId: 'fac_war',
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        // ['fac', 'war', 'aceitar'|'recusar', warId]
        const acao = parts[2];
        const warId = parts[3];
        const userId = interaction.user.id;

        const war = await prisma.factionWar.findUnique({ where: { id: warId } });
        if (!war) {
            return interaction.reply({ content: '❌ Essa guerra não existe mais!', flags: [MessageFlags.Ephemeral] });
        }
        if (war.status !== 'proposta') {
            return interaction.reply({ content: '⏳ Essa guerra já foi resolvida, não dá mais pra mexer!', flags: [MessageFlags.Ephemeral] });
        }

        const targetFaction = await prisma.faction.findUnique({ where: { id: war.factionBId } });
        const challenger = await prisma.faction.findUnique({ where: { id: war.factionAId } });

        // Só o Líder da facção desafiada decide
        if (userId !== targetFaction.leaderId) {
            return interaction.reply({ content: `👑 Só o Líder da **${targetFaction.name}** pode aceitar ou recusar a guerra!`, flags: [MessageFlags.Ephemeral] });
        }

        if (acao === 'recusar') {
            await prisma.factionWar.delete({ where: { id: warId } });
            return interaction.update({
                content: `🕊️ **GUERRA RECUSADA!**\n\nA **${targetFaction.name}** [${targetFaction.tag}] recusou o confronto contra a **${challenger.name}** [${challenger.tag}]. Ninguém perdeu nada, mas o desafio ficou no ar...`,
                embeds: [],
                components: []
            });
        }

        // ---------- ACEITAR ----------
        const [facA, facB] = await Promise.all([
            prisma.faction.findUnique({ where: { id: war.factionAId } }),
            prisma.faction.findUnique({ where: { id: war.factionBId } })
        ]);
        if (!facA || !facB || facA.bank < war.bet || facB.bank < war.bet) {
            await prisma.factionWar.delete({ where: { id: warId } });
            return interaction.update({
                content: `💸 **GUERRA CANCELADA!** Uma das facções ficou sem caixa pra bancar a aposta de **$${war.bet.toLocaleString('pt-BR')}**.`,
                embeds: [],
                components: []
            });
        }

        const endsAt = new Date(Date.now() + DURACAO_MIN * 60 * 1000);
        await prisma.$transaction([
            prisma.faction.update({ where: { id: war.factionAId }, data: { bank: { decrement: war.bet } } }),
            prisma.faction.update({ where: { id: war.factionBId }, data: { bank: { decrement: war.bet } } }),
            prisma.factionWar.update({ where: { id: warId }, data: { status: 'ativo', endsAt, channelId: interaction.channelId } })
        ]);

        // Timer best-effort pra resolver no tempo; o `k fac guerra` cobre restart do bot
        const client = interaction.client;
        setTimeout(() => {
            prisma.factionWar.findUnique({ where: { id: warId } })
                .then(async (w) => {
                    if (w && w.status === 'ativo' && new Date(w.endsAt) <= new Date()) {
                        const msg = await settleWar(w);
                        if (msg && w.channelId) {
                            const channel = await client.channels.fetch(w.channelId).catch(() => null);
                            if (channel) channel.send(msg).catch(() => {});
                        }
                    }
                })
                .catch(() => {});
        }, DURACAO_MIN * 60 * 1000);

        return interaction.update({
            content: `🔥 **GUERRA DECLARADA!**\n\n**${challenger.name}** [${challenger.tag}] **vs** **${targetFaction.name}** [${targetFaction.tag}] — agora é na tora!\n\n💰 **$${war.bet.toLocaleString('pt-BR')}** de cada facção no pote (**$${(war.bet * 2).toLocaleString('pt-BR')}**)\n⏳ Dura **${DURACAO_MIN} minutos**\n⚔️ **Roubem membros da facção inimiga pra marcar pontos!** Quem fizer mais roubos, leva o pote!\n\nBoa sorte pros dois lados!`,
            embeds: [],
            components: []
        });
    }
};
