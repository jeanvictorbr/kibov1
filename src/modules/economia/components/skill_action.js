import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { SKILLS, SKILL_ORDER, parseSkills, getSkillCost } from '../../../utils/skillConfig.js';

export default {
    customId: 'skill_action',
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const stat = parts[2]; // 'sorte', 'labia', 'agilidade', 'inteligencia', 'forca', 'intimidacao'
        const ownerId = parts[3];

        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: 'Tira a mão, chefe! Vá gastar o seu próprio dinheiro nas suas habilidades.', ephemeral: true });
        }

        if (!SKILLS[stat]) {
            return interaction.reply({ content: '❌ Habilidade desconhecida!', ephemeral: true });
        }

        const user = await prisma.user.findUnique({ where: { userId: ownerId } });
        const skills = parseSkills(user.skills);

        const currentLvl = skills[stat] || 1;
        const maxLvl = SKILLS[stat].max;

        if (currentLvl >= maxLvl) {
            return interaction.reply({ content: `❌ **${SKILLS[stat].name}** já se encontra no nível máximo!`, ephemeral: true });
        }

        // A MATEMÁTICA PESADA: Custo base dobra a cada nível
        const cost = getSkillCost(stat, currentLvl);

        if (user.balance < cost) {
            return interaction.reply({ content: `❌ Precisas de **$${cost.toLocaleString()}** na CARTEIRA para melhorar a tua ${SKILLS[stat].name}!`, ephemeral: true });
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

        const rows = [];
        for (let i = 0; i < SKILL_ORDER.length; i += 2) {
            const row = new ActionRowBuilder();
            for (const key of SKILL_ORDER.slice(i, i + 2)) {
                const lvl = skills[key] || 1;
                const costNext = getSkillCost(key, lvl);
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`skill_action_${key}_${ownerId}`)
                        .setLabel(lvl >= SKILLS[key].max ? `${SKILLS[key].name} MÁXIMA` : `Up ${SKILLS[key].name} ($${costNext.toLocaleString()})`)
                        .setStyle(ButtonStyle[SKILLS[key].style])
                        .setDisabled(lvl >= SKILLS[key].max)
                );
            }
            rows.push(row);
        }

        await interaction.update({
            content: `# 🆙 LEVEL UP!\nA tua habilidade **${SKILLS[stat].name}** subiu para o nível **${skills[stat]}**!`,
            embeds: [embed],
            components: rows
        });
    }
};
