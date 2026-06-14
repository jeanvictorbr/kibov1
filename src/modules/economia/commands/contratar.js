import { prisma } from '../../../core/database.js';

export default {
    name: 'contratar',
    execute: async (message, args) => {
        const guildId = message.guild.id;
        const authorId = message.author.id;

        const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
        const delegadoId = guildConfig?.delegadoId || message.guild.ownerId;

        if (authorId !== delegadoId) {
            return message.reply(`❌ **Acesso Negado!** Você não é o Delegado dessa quebrada. Só o <@${delegadoId}> pode liberar o distintivo.`);
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('🚓 Menciona aí quem você quer chamar pra polícia! Ex: `k contratar @user`');
        }

        if (targetUser.bot) return message.reply('🤖 Robô não segura fuzil, chefe. Contrata um jogador de verdade!');

        try {
            await prisma.policeBadge.create({
                data: {
                    userId: targetUser.id,
                    guildId: guildId
                }
            });
            message.reply(`🚨 **BEM-VINDO À FORÇA!** O <@${targetUser.id}> acabou de ganhar o distintivo da cidade. Ele já pode colar no \`k trabalhar\` e pegar a farda.`);
        } catch (error) {
            message.reply(`⚠️ O mano <@${targetUser.id}> já é Oficial da PM nesse servidor. O cara já tá na rua patrulhando!`);
        }
    }
};