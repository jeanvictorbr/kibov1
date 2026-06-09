import { prisma } from '../../../core/database.js';
import { parseAmount } from '../../../utils/parser.js';

export default {
    customId: 'dev_modal', // O loader vai jogar tudo o que começar por "dev_modal_" aqui
    execute: async (interaction, client) => {
        if (interaction.user.id !== process.env.DEVELOPER_ID) return;

        const customId = interaction.customId; // ex: dev_modal_addmoney
        const action = customId.replace('dev_modal_', '');

        try {
            // INFO DA GUILDA
            if (action === 'serverinfo') {
                const guildId = interaction.fields.getTextInputValue('guild_id');
                const guild = client.guilds.cache.get(guildId);
                if (!guild) return interaction.reply({ content: '❌ ID de Servidor inválido ou Kibo não está lá.', ephemeral: true });
                const owner = await guild.fetchOwner();
                const info = `🏰 **Painel da Guilda: ${guild.name}**\n• **ID:** \`${guild.id}\`\n• **Dono:** ${owner.user.tag} \`(${owner.id})\`\n• **Membros:** ${guild.memberCount}`;
                return interaction.reply({ content: info, ephemeral: true });
            }

            // EXPULSAR O KIBO
            if (action === 'leaveguild') {
                const guildId = interaction.fields.getTextInputValue('guild_id');
                const guild = client.guilds.cache.get(guildId);
                if (!guild) return interaction.reply({ content: '❌ Servidor não localizado.', ephemeral: true });
                await guild.leave();
                return interaction.reply({ content: `✅ Saí do servidor **${guild.name}** a teu pedido, chefe.`, ephemeral: true });
            }

            // GERIR DINHEIRO (Adicionar ou Remover)
            if (action === 'addmoney' || action === 'removemoney') {
                const userId = interaction.fields.getTextInputValue('user_id');
                const amountRaw = interaction.fields.getTextInputValue('amount');
                const amount = parseAmount(amountRaw);

                if (amount <= 0 || isNaN(amount)) return interaction.reply({ content: '❌ Valor inválido. Use números ou "1m", "1b".', ephemeral: true });

                if (action === 'addmoney') {
                    await prisma.user.upsert({
                        where: { userId },
                        update: { balance: { increment: amount } },
                        create: { userId, balance: amount }
                    });
                    return interaction.reply({ content: `✅ Injetados **$${amount.toLocaleString()}** na conta de <@${userId}>.`, ephemeral: true });
                } else {
                    await prisma.user.update({
                        where: { userId },
                        data: { balance: { decrement: amount } }
                    });
                    return interaction.reply({ content: `💸 Removidos **$${amount.toLocaleString()}** da conta de <@${userId}>.`, ephemeral: true });
                }
            }

            // BANIR / DESBANIR USUÁRIO
            if (action === 'banuser' || action === 'unbanuser') {
                const userId = interaction.fields.getTextInputValue('user_id');
                
                if (action === 'banuser') {
                    await prisma.user.upsert({
                        where: { userId },
                        update: { isBanned: true },
                        create: { userId, isBanned: true }
                    });
                    return interaction.reply({ content: `🔨 **Usuário <@${userId}> banido globalmente!**`, ephemeral: true });
                } else {
                    await prisma.user.update({
                        where: { userId },
                        data: { isBanned: false }
                    });
                    return interaction.reply({ content: `✅ **Usuário <@${userId}> desbanido.** Tá livre para operar a economia.`, ephemeral: true });
                }
            }

            // WHITE-LABEL
            if (action === 'setwl') {
                const guildId = interaction.fields.getTextInputValue('guild_id');
                const wlName = interaction.fields.getTextInputValue('wl_name');
                const wlAvatar = interaction.fields.getTextInputValue('wl_avatar') || null;
                const wlWebhookUrl = interaction.fields.getTextInputValue('wl_url');

                await prisma.guildConfig.upsert({
                    where: { guildId },
                    update: { wlActive: true, wlName, wlAvatar, wlWebhookUrl },
                    create: { guildId, wlActive: true, wlName, wlAvatar, wlWebhookUrl }
                });
                return interaction.reply({ content: `👻 **White-Label Ativado!** Servidor \`${guildId}\` agora fala como **${wlName}**.`, ephemeral: true });
            }

        } catch (error) {
            console.error("Erro Modal Dev:", error);
            return interaction.reply({ content: '❌ Erro no banco de dados. Verifica se o ID do utilizador realmente existe.', ephemeral: true });
        }
    }
};