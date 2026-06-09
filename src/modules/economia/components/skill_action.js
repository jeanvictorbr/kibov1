import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    customId: 'skill_action', 
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const stat = parts[2]; // 'sorte' ou 'labia'
        const ownerId = parts[3];

        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: 'Tira a mão, chefe! Vá gastar o seu próprio dinheiro nas suas habilidades.', ephemeral: true });
        }

        const user = await prisma.user.findUnique({ where: { userId: ownerId } });
        const skills = typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || {});
        
        const currentLvl = skills[stat] || 1;
        const maxLvl = 10;

        if (currentLvl >= maxLvl) {
            return interaction.reply({ content: '❌ Esta habilidade já se encontra no nível máximo!', ephemeral: true });
        }

        // A MATEMÁTICA PESADA: Dobrando o custo base de $50k
        const baseCost = 50000;
        const cost = baseCost * Math.pow(2, currentLvl - 1);

        if (user.balance < cost) {
            return interaction.reply({ content: `❌ Precisas de **$${cost.toLocaleString()}** na CARTEIRA para melhorar a tua ${stat.toUpperCase()}!`, ephemeral: true });
        }

        // 1. Sobe de Nível
        skills[stat] = currentLvl + 1;

        // 2. Atualiza no Banco de Dados cobrando o valor dobrado
        await prisma.user.update({
            where: { userId: ownerId },
            data: {
                balance: { decrement: cost },
                skills: skills
            }
        });

        // 3. Recalcula tudo para desenhar a nova tela com o valor do PRÓXIMO nível
        const sorteLvl = skills.sorte || 1;
        const labiaLvl = skills.labia || 1;
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
                .setCustomId(`skill_action_sorte_${ownerId}`)
                .setLabel(sorteLvl >= maxLvl ? 'Sorte MÁXIMA' : `Up Sorte ($${costSorte.toLocaleString()})`)
                .setStyle(ButtonStyle.Success)
                .setDisabled(sorteLvl >= maxLvl),
            new ButtonBuilder()
                .setCustomId(`skill_action_labia_${ownerId}`)
                .setLabel(labiaLvl >= maxLvl ? 'Lábia MÁXIMA' : `Up Lábia ($${costLabia.toLocaleString()})`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(labiaLvl >= maxLvl)
        );

        await interaction.update({ 
            content: `# 🆙 LEVEL UP!\nA tua habilidade **${stat.toUpperCase()}** subiu para o nível **${skills[stat]}**!`, 
            embeds: [embed], 
            components: [row] 
        });
    }
};