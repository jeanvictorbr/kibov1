import { EmbedBuilder, MessageFlags } from 'discord.js';
import { HELP_CATEGORIES, overviewFields, categorySelect } from '../../../utils/helpCategories.js';

export default {
    customId: 'ajuda_cat',
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const ownerId = parts[2];

        if (interaction.user.id !== ownerId) {
            return interaction.reply({
                content: '🛑 Esse manual é de outra pessoa! Roda `k ajuda` pra abrir o seu.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        const escolha = interaction.values[0];

        // 📜 Opção "Ver tudo": volta pro resumo geral
        if (escolha === 'resumo') {
            const embed = new EmbedBuilder()
                .setTitle('📖 MANUAL DO IMPÉRIO KIBO')
                .setDescription('Resumo geral com **todos** os comandos. Escolhe uma categoria no menu pra ver cada sistema com mais detalhes!')
                .setColor('#FFD700')
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .addFields(overviewFields());

            return interaction.update({
                embeds: [embed],
                components: [categorySelect(ownerId, 'Escolhe uma categoria pra ver tudo com detalhes...')]
            });
        }

        const cat = HELP_CATEGORIES.find(c => c.id === escolha);
        if (!cat) {
            return interaction.reply({ content: '❌ Categoria desconhecida!', flags: [MessageFlags.Ephemeral] });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${cat.emoji} ${cat.title}`)
            .setDescription(cat.desc)
            .setColor('#FFD700')
            .addFields(cat.fields);

        return interaction.update({
            embeds: [embed],
            components: [categorySelect(ownerId, 'Escolhe outra categoria...')]
        });
    }
};
