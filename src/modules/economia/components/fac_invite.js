import { MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { isPoliceOfficer } from '../../../utils/factionService.js';

export default {
    customId: 'fac_invite',
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        // ['fac', 'invite', 'aceitar'|'recusar', factionId, userId]
        const action = parts[2];
        const factionId = parts[3];
        const targetId = parts[4];

        if (interaction.user.id !== targetId) {
            return interaction.reply({ content: 'Não é teu convite, chefe!', flags: [MessageFlags.Ephemeral] });
        }

        const faction = await prisma.faction.findUnique({ where: { id: factionId } });
        if (!faction) {
            return interaction.reply({ content: '❌ Essa facção não existe mais!', flags: [MessageFlags.Ephemeral] });
        }

        const existing = await prisma.factionMember.findFirst({ where: { userId: targetId, guildId: interaction.guild.id } });
        if (existing) {
            return interaction.reply({ content: '❌ Você já é membro de uma facção!', flags: [MessageFlags.Ephemeral] });
        }

        if (action === 'recusar') {
            return interaction.update({ content: '🚫 Você recusou o convite. Fica na tua!', embeds: [], components: [] });
        }

        // ACEITAR
        const isPM = await isPoliceOfficer(targetId, interaction.guild.id);
        if (isPM) {
            return interaction.update({ content: '🚓 Oficial da PM não entra em facção criminosa! Largue o distintivo antes.', embeds: [], components: [] });
        }

        await prisma.factionMember.create({
            data: { factionId: faction.id, guildId: interaction.guild.id, userId: targetId, rank: 'membro' }
        });

        return interaction.update({
            content: `✅ **BEM-VINDO AO SUBMUNDO!** Você agora é membro da **${faction.name}** [${faction.tag}]. Roda um \`k operacao\` pra render!`,
            embeds: [],
            components: []
        });
    }
};
