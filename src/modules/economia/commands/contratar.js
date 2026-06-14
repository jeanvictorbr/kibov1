import { prisma } from '../../../core/database.js';

export default {
    name: 'contratar',
    execute: async (message, args) => {
        const guildId = message.guild.id;
        const authorId = message.author.id;

        // 1. O Bot descobre quem é o Delegado de verdade
        const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
        const delegadoId = guildConfig?.delegadoId || message.guild.ownerId;

        // 2. Barreira de Segurança
        if (authorId !== delegadoId) {
            return message.reply(`❌ **Acesso Negado!** Você não é o Delegado desta cidade. Apenas o <@${delegadoId}> pode distribuir distintivos.`);
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('🚓 Mencione quem você quer contratar para a força policial! Ex: `k contratar @user`');
        }

        if (targetUser.bot) return message.reply('🤖 Robôs não podem segurar armas. Contrate um jogador de verdade!');

        // 3. Tenta dar o Distintivo
        try {
            await prisma.policeBadge.create({
                data: {
                    userId: targetUser.id,
                    guildId: guildId
                }
            });
            message.reply(`🚨 **BEM-VINDO À FORÇA!** O <@${targetUser.id}> acabou de receber o distintivo da cidade. Ele já pode assumir o cargo de Policial no \`k trabalhar\`.`);
        } catch (error) {
            // Como usamos @@unique no banco, se der erro é porque ele já é polícia
            message.reply(`⚠️ O <@${targetUser.id}> já é um Oficial da Polícia neste servidor!`);
        }
    }
};