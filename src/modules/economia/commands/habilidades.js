import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { SKILLS, SKILL_ORDER, parseSkills, getSkillCost } from '../../../utils/skillConfig.js';

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

        const skills = parseSkills(user.skills);

        const embed = new EmbedBuilder()
            .setTitle('🧠 ÁRVORE DE HABILIDADES')
            .setDescription('Invista seu dinheiro na carteira para aprimorar suas habilidades e dominar o submundo! **O custo dobra a cada nível.**')
            .setColor('#00FFFF')
            .addFields(
                SKILL_ORDER.map(key => ({
                    name: `${SKILLS[key].emoji} ${SKILLS[key].name} (Nível ${skills[key] || 1}/${SKILLS[key].max})`,
                    value: SKILLS[key].desc,
                    inline: false
                }))
            )
            .setFooter({ text: 'O dinheiro é descontado diretamente da sua CARTEIRA.' });

        // Botões 2 por linha (6 skills = 3 linhas)
        const rows = [];
        for (let i = 0; i < SKILL_ORDER.length; i += 2) {
            const row = new ActionRowBuilder();
            for (const key of SKILL_ORDER.slice(i, i + 2)) {
                const lvl = skills[key] || 1;
                const cost = getSkillCost(key, lvl);
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`skill_action_${key}_${userId}`)
                        .setLabel(lvl >= SKILLS[key].max ? `${SKILLS[key].name} MÁXIMA` : `Up ${SKILLS[key].name} ($${cost.toLocaleString()})`)
                        .setStyle(ButtonStyle[SKILLS[key].style])
                        .setDisabled(lvl >= SKILLS[key].max)
                );
            }
            rows.push(row);
        }

        await message.reply({ embeds: [embed], components: rows });
    }
};
