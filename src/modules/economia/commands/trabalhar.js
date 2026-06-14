import { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';

export default {
    name: 'trabalhar',
    execute: async (message) => {
        const embed = new EmbedBuilder()
            .setTitle('🏢 Agência de Empregos do Submundo')
            .setDescription('A vida não tá fácil e você precisa fazer dinheiro. Escolhe seu caminho aí, chefe. Só se liga: quanto maior o risco, maior o lucro.')
            .setColor('#2F3136')
            .addFields(
                { name: '👷 Cidadão Honesto', value: 'Trabalho seguro. Ganha dinheiro limpo sem risco de ir em cana.' },
                { name: '🥷 Ladrão de Rua', value: 'Bate carteira e arromba caixa. Risco alto, mas o lucro é absurdo.' },
                { name: '💻 Hacker', value: 'Invade conta bancária no silêncio do seu quarto.' },
                { name: '🚓 Oficial de Polícia', value: 'Caça os criminosos. **Requer o distintivo do Delegado da cidade.**' }
            );

        const menu = new StringSelectMenuBuilder()
            .setCustomId('job_select')
            .setPlaceholder('Escolhe sua Profissão...')
            .addOptions([
                { label: 'Cidadão Honesto', description: 'Trabalho normal, sem dor de cabeça.', value: 'cidadao', emoji: '👷' },
                { label: 'Ladrão de Rua', description: 'Roubo rápido e sujo nas ruas.', value: 'ladrao', emoji: '🥷' },
                { label: 'Hacker', description: 'Crime cibernético e invasão de sistema.', value: 'hacker', emoji: '💻' },
                { label: 'Oficial de Polícia', description: 'Aplica a lei e bota bandido na jaula.', value: 'policial', emoji: '🚓' },
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await message.reply({ embeds: [embed], components: [row] });
    }
};