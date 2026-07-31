import { EmbedBuilder } from 'discord.js';
import { overviewFields, categorySelect } from '../../../utils/helpCategories.js';

export default {
    name: 'ajuda',
    aliases: ['help', 'comandos'],
    execute: async (message) => {
        const embed = new EmbedBuilder()
            .setTitle('📖 MANUAL DO IMPÉRIO KIBO')
            .setDescription('Bem-vindo à central de ajuda, chefe! Aqui estão **todos** os comandos do Kibo. Usa o **menu de categorias** abaixo pra ver cada sistema com mais detalhes.\n\n🚨 **TÁ PERDIDO NA CIDADE?**\nDigite **`k tutorial`** para abrir o **Guia Definitivo e Interativo** com a explicação completa de cada sistema, tempos de espera e chances de prisão!')
            .setColor('#FFD700')
            .setThumbnail(message.client.user.displayAvatarURL())
            .addFields(overviewFields())
            .setFooter({ text: 'Kibo Engine • Desenvolvido para Magnatas', iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        await message.reply({
            embeds: [embed],
            components: [categorySelect(message.author.id, 'Escolhe uma categoria pra ver tudo com detalhes...')]
        });
    }
};
