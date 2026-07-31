import { EmbedBuilder, MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { FACTIONS } from '../../../utils/factionConfig.js';
import { isPoliceOfficer, getMemberOfUser, generateTag, pendingCreation } from '../../../utils/factionService.js';

export default {
    customId: 'fac_create',
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        // ['fac', 'create', 'ramo', userId]
        const userId = parts[3];

        if (interaction.user.id !== userId) {
            return interaction.reply({ content: 'Não é teu pedido, chefe!', flags: [MessageFlags.Ephemeral] });
        }

        const pending = pendingCreation.get(userId);
        if (!pending || Date.now() - pending.timestamp > 120000) {
            pendingCreation.delete(userId);
            return interaction.reply({ content: '⏳ Esse pedido expirou! Dá um `k fac criar <nome>` de novo.', flags: [MessageFlags.Ephemeral] });
        }

        const ramo = interaction.values[0];
        if (!FACTIONS[ramo]) {
            return interaction.reply({ content: '❌ Ramo inválido!', flags: [MessageFlags.Ephemeral] });
        }

        const guildId = interaction.guild.id;
        const name = pending.name;

        // Revalidação de segurança antes de criar
        const existing = await getMemberOfUser(userId, guildId);
        if (existing) return interaction.reply({ content: '❌ Você já faz parte de uma facção!', flags: [MessageFlags.Ephemeral] });

        const isPM = await isPoliceOfficer(userId, guildId);
        if (isPM) return interaction.reply({ content: '🚓 Oficial da PM não pode comandar uma facção criminosa!', flags: [MessageFlags.Ephemeral] });

        const tag = await generateTag(guildId, name);
        const faction = await prisma.faction.create({
            data: { name, tag, ramo, guildId, leaderId: userId }
        });
        await prisma.factionMember.create({
            data: { factionId: faction.id, guildId, userId, rank: 'lider' }
        });

        pendingCreation.delete(userId);

        const f = FACTIONS[ramo];
        const embed = new EmbedBuilder()
            .setTitle(`${f.emoji} FACÇÃO FUNDADA!`)
            .setDescription(`**${name}** [${tag}] nasceu no submundo!\n\n📦 **Ramo:** ${f.name}\n👑 **Líder:** <@${userId}>\n\n*${f.desc}*`)
            .setColor('#FF5555')
            .setFooter({ text: 'Recrute gente com `k fac convidar @user`' });

        return interaction.update({ content: null, embeds: [embed], components: [] });
    }
};
