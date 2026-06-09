import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    name: 'habilidades',
    execute: async (message) => {
        const userId = message.author.id;

        // Garante que o user existe usando upsert
        const user = await prisma.user.upsert({
            where: { userId },
            update: {},
            create: { userId }
        });

        const skills = typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || {});
        
        const sorteLvl = skills.sorte || 1;
        const labiaLvl = skills.labia || 1;
        const maxLvl = 10; 

        // O custo DOBRA a cada nível. Base de $50.000
        const baseCost = 50000;
        const costSorte = baseCost * Math.pow(2, sorteLvl - 1);
        const costLabia = baseCost * Math.pow(2, labiaLvl - 1);

        const embed = new EmbedBuilder()
            .setTitle('🧠 ÁRVORE DE HABILIDADES')
            .setDescription('Invista seu dinheiro na carteira para aprimorar suas habilidades e dominar o submundo! **O custo dobra a cada nível.**')
            .setColor('#00FFFF')
            .addFields(
                { name: `🍀 Sorte (Nível ${sorteLvl}/${maxLvl})`, value: 'Aumenta em 5% os seus lucros em trabalhos e roubos por nível.', inline: false },
                { name: `🗣️ Lábia (Nível ${labiaLvl}/${maxLvl})`, value: 'Reduz em 5% o valor das multas quando a polícia te pega por nível.', inline: false }
            )
            .setFooter({ text: 'O dinheiro é descontado diretamente da sua CARTEIRA.' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`skill_action_sorte_${userId}`)
                .setLabel(sorteLvl >= maxLvl ? 'Sorte MÁXIMA' : `Up Sorte ($${costSorte.toLocaleString()})`)
                .setStyle(ButtonStyle.Success)
                .setDisabled(sorteLvl >= maxLvl),
            new ButtonBuilder()
                .setCustomId(`skill_action_labia_${userId}`)
                .setLabel(labiaLvl >= maxLvl ? 'Lábia MÁXIMA' : `Up Lábia ($${costLabia.toLocaleString()})`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(labiaLvl >= maxLvl)
        );

        await message.reply({ embeds: [embed], components: [row] });
    }
};