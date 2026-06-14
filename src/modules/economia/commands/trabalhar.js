import { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';

export default {
    name: 'trabalhar',
    execute: async (message) => {
        const embed = new EmbedBuilder()
            .setTitle('🏢 Agência de Empregos do Submundo')
            .setDescription('A vida não está fácil e precisas de fazer dinheiro. Escolhe o teu caminho. Lembra-te: quanto maior o risco, maior o lucro.')
            .setColor('#2F3136')
            .addFields(
                { name: '👷 Cidadão Honesto', value: 'Trabalho seguro. Ganha dinheiro limpo sem riscos de ser preso.' },
                { name: '🥷 Ladrão de Rua', value: 'Bate carteiras. Risco alto, mas liberta comandos de assalto.' },
                { name: '💻 Hacker', value: 'Invade contas bancárias no silêncio do teu quarto.' },
                { name: '🚓 Oficial de Polícia', value: 'Caça os criminosos. **Requer um distintivo do Delegado local.**' }
            );

        const menu = new StringSelectMenuBuilder()
            .setCustomId('job_select')
            .setPlaceholder('Selecione a sua Profissão...')
            .addOptions([
                { label: 'Cidadão Honesto', description: 'Trabalho normal, sem dores de cabeça.', value: 'cidadao', emoji: '👷' },
                { label: 'Ladrão de Rua', description: 'Roubos rápidos e sujos na rua.', value: 'ladrao', emoji: '🥷' },
                { label: 'Hacker', description: 'Crimes cibernéticos e invasões.', value: 'hacker', emoji: '💻' },
                { label: 'Oficial de Polícia', description: 'Aplicar a lei e prender ladrões.', value: 'policial', emoji: '🚓' },
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await message.reply({ embeds: [embed], components: [row] });
    }
};