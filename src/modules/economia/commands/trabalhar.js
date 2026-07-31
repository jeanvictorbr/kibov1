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
                { name: '🚓 Oficial de Polícia', value: 'Caça os criminosos. **Requer o distintivo do Delegado da cidade.**' },
                { name: '🩺 Médico', value: 'Cura os feridos do morro e cobra caro pelo serviço. Trabalho legal e lucrativo.' },
                { name: '⚖️ Advogado', value: 'Defende os presos e reduz a pena de quem tem grana pra pagar. Lábia vale ouro aqui.' },
                { name: '👮 Segurança Privado', value: 'Blinda clientes de assalto. Quem paga, não cai na mão do ladrão.' },
                { name: '🧨 Sequestrador', value: 'Seca o rico da cidade. Sequestra, cobra resgate e ri do sofrimento alheio.' },
                { name: '📦 Contrabandista', value: 'Cruza a fronteira com mercadoria quente. Lucro alto, mas o tiro anda solto.' }
            );

        const menu = new StringSelectMenuBuilder()
            .setCustomId('job_select')
            .setPlaceholder('Escolhe sua Profissão...')
            .addOptions([
                { label: 'Cidadão Honesto', description: 'Trabalho normal, sem dor de cabeça.', value: 'cidadao', emoji: '👷' },
                { label: 'Ladrão de Rua', description: 'Roubo rápido e sujo nas ruas.', value: 'ladrao', emoji: '🥷' },
                { label: 'Hacker', description: 'Crime cibernético e invasão de sistema.', value: 'hacker', emoji: '💻' },
                { label: 'Oficial de Polícia', description: 'Aplica a lei e bota bandido na jaula.', value: 'policial', emoji: '🚓' },
                { label: 'Médico', description: 'Cura ferido e cobra pelo remédio.', value: 'medico', emoji: '🩺' },
                { label: 'Advogado', description: 'Puxa processo e reduz pena dos preso.', value: 'advogado', emoji: '⚖️' },
                { label: 'Segurança Privado', description: 'Protege o cliente de assalto.', value: 'seguranca', emoji: '👮' },
                { label: 'Sequestrador', description: 'Seca rico e cobra resgate.', value: 'sequestrador', emoji: '🧨' },
                { label: 'Contrabandista', description: 'Cruza fronteira com mercadoria quente.', value: 'contrabandista', emoji: '📦' },
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await message.reply({ embeds: [embed], components: [row] });
    }
};