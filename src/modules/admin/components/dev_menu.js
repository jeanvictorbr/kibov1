import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
    customId: 'dev_menu',
    execute: async (interaction, client) => {
        if (interaction.user.id !== process.env.DEVELOPER_ID) {
            return interaction.reply({ content: '❌ Acesso restrito.', ephemeral: true });
        }

        const value = interaction.values[0];

        // Opção que não precisa de pop-up (Mostra na hora)
        if (value === 'servers') {
            const lista = client.guilds.cache.map(g => `• **${g.name}** \`(ID: ${g.id})\` - ${g.memberCount} membros`).join('\n');
            return interaction.reply({ content: `🌐 **Servidores Ativos no Kibo:**\n${lista || 'Nenhum servidor encontrado.'}`, ephemeral: true });
        }

        // --- CONSTRUÇÃO DOS POP-UPS (MODAIS) ---
        let modal;
        
        if (value === 'server_info') {
            modal = new ModalBuilder().setCustomId('dev_modal_serverinfo').setTitle('Informações da Guilda');
            const input = new TextInputBuilder().setCustomId('guild_id').setLabel('ID do Servidor').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
        }
        else if (value === 'leave_guild') {
            modal = new ModalBuilder().setCustomId('dev_modal_leaveguild').setTitle('Expulsar Kibo');
            const input = new TextInputBuilder().setCustomId('guild_id').setLabel('ID do Servidor').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
        }
        else if (value === 'add_money' || value === 'remove_money') {
            const isAdd = value === 'add_money';
            modal = new ModalBuilder().setCustomId(isAdd ? 'dev_modal_addmoney' : 'dev_modal_removemoney').setTitle(isAdd ? 'Injetar Capital' : 'Recolher Capital');
            const userInput = new TextInputBuilder().setCustomId('user_id').setLabel('ID do Usuário').setStyle(TextInputStyle.Short).setRequired(true);
            const amountInput = new TextInputBuilder().setCustomId('amount').setLabel('Valor (Ex: 1500, 10m, 1b)').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(userInput), new ActionRowBuilder().addComponents(amountInput));
        }
        else if (value === 'ban_user' || value === 'unban_user') {
            const isBan = value === 'ban_user';
            modal = new ModalBuilder().setCustomId(isBan ? 'dev_modal_banuser' : 'dev_modal_unbanuser').setTitle(isBan ? 'Banir Usuário' : 'Desbanir Usuário');
            const userInput = new TextInputBuilder().setCustomId('user_id').setLabel('ID do Usuário').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(userInput));
        }
        else if (value === 'set_wl') {
            modal = new ModalBuilder().setCustomId('dev_modal_setwl').setTitle('Configurar White-Label');
            const guildInput = new TextInputBuilder().setCustomId('guild_id').setLabel('ID do Servidor').setStyle(TextInputStyle.Short).setRequired(true);
            const nameInput = new TextInputBuilder().setCustomId('wl_name').setLabel('Nome do Webhook').setStyle(TextInputStyle.Short).setRequired(true);
            const avatarInput = new TextInputBuilder().setCustomId('wl_avatar').setLabel('URL da Imagem (Opcional)').setStyle(TextInputStyle.Short).setRequired(false);
            const urlInput = new TextInputBuilder().setCustomId('wl_url').setLabel('URL do Webhook').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(
                new ActionRowBuilder().addComponents(guildInput),
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(avatarInput),
                new ActionRowBuilder().addComponents(urlInput)
            );
        }

        if (modal) await interaction.showModal(modal);
    }
};