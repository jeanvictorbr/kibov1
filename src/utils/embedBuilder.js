import { EmbedBuilder } from 'discord.js';

export function createEmbed(data = {}) {
    const embed = new EmbedBuilder()
        .setColor('#FFD700') // Dourado premium Kibo
        .setTitle(data.title || null)
        .setDescription(data.description || null)
        .setTimestamp()
        .setFooter({ text: 'Kibo Engine • Economia Global', iconURL: null });

    if (data.fields) embed.addFields(data.fields);
    
    return embed;
}