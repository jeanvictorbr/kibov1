import { prisma } from '../../../core/database.js';

export default {
    name: 'dev_delegado',
    execute: async (message, args) => {
        // Validação básica de DEV (Substitua pelo seu ID se quiser chumbar aqui)
        if (message.author.id !== '1070658145740926987') return;

        const targetUser = message.mentions.users.first();
        const guildId = args[1] || message.guild.id; // Permite setar o ID do servidor na mão

        if (!targetUser && args[0] !== 'reset') {
            return message.reply('🔧 **Uso DEV:** `k dev_delegado @user [ID_Guild]` ou `k dev_delegado reset` para devolver ao Dono.');
        }

        if (args[0] === 'reset') {
            await prisma.guildConfig.deleteMany({ where: { guildId } });
            return message.reply(`✅ Configuração resetada! O Dono do servidor (Owner) voltou a ser o Delegado oficial.`);
        }

        // Upsert: Cria ou Atualiza a configuração do servidor
        await prisma.guildConfig.upsert({
            where: { guildId },
            update: { delegadoId: targetUser.id },
            create: { guildId, delegadoId: targetUser.id }
        });

        message.reply(`👮 **Poder Transferido!** O jogador <@${targetUser.id}> é o novo Delegado oficial da guilda \`${guildId}\`.`);
    }
};