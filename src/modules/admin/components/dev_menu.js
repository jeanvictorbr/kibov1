import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import os from 'os'; // Necessário para ler o consumo de memória RAM da máquina

export default {
    customId: 'dev_menu',
    execute: async (interaction, client) => {
        if (interaction.user.id !== process.env.DEVELOPER_ID) {
            return interaction.reply({ content: '❌ Acesso restrito.', ephemeral: true });
        }

        const value = interaction.values[0];

        // ==========================================
        // 1. OPÇÕES DIRETAS (Sem Pop-up de texto)
        // ==========================================
        
        if (value === 'servers') {
            const lista = client.guilds.cache.map(g => `• **${g.name}** \`(ID: ${g.id})\` - ${g.memberCount} membros`).join('\n');
            return interaction.reply({ content: `🌐 **Servidores Ativos no Kibo:**\n${lista || 'Nenhum servidor encontrado.'}`, ephemeral: true });
        }

        if (value === 'status_system') {
            const totalServers = client.guilds.cache.size;
            const totalUsers = client.users.cache.size;
            
            const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const memoryTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
            
            const totalSeconds = (client.uptime / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            
            const dbStats = await prisma.user.aggregate({ _sum: { balance: true, bank: true, kiboCash: true } });
            const totalBusinesses = await prisma.userBusiness.count();
            const somaTotalMoeda = (dbStats._sum.balance || 0) + (dbStats._sum.bank || 0);

            const embed = new EmbedBuilder()
                .setTitle('🖥️ STATUS OPERACIONAL DO SISTEMA')
                .setColor('#00FFCC')
                .addFields(
                    { name: '📡 Infraestrutura', value: `**Servidores:** ${totalServers}\n**Usuários (Cache):** ${totalUsers}\n**Uptime:** ${days}d ${hours}h ${minutes}m\n**RAM:** ${memoryUsed}MB / ${Math.round(memoryTotal)}GB` },
                    { name: '💰 Economia Global', value: `**Dinheiro:** $${somaTotalMoeda.toLocaleString()}\n**KiboCash:** $${(dbStats._sum.kiboCash || 0).toLocaleString()}\n**Empresas:** ${totalBusinesses}` }
                );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // ==========================================
        // 2. SISTEMA DE WIPE (Confirmação Dupla Segurança)
        // ==========================================
        
        if (['wipe_money', 'wipe_kibocash', 'wipe_business'].includes(value)) {
            let type = value.split('_')[1]; // Pega "money", "kibocash" ou "business"
            let targetLabel = type === 'money' ? 'TODO O DINHEIRO (Carteira e Banco)' : type === 'kibocash' ? 'TODO O KIBOCASH' : 'TODAS AS EMPRESAS DO SERVIDOR';

            const confirmEmbed = new EmbedBuilder()
                .setTitle('⚠️ OPERAÇÃO DE ALTO RISCO DETECTADA')
                .setDescription(`Você solicitou o **WIPE TOTAL** de **${targetLabel}**.\n\nIsso afetará **TODOS** os usuários do banco de dados de forma **IRREVERSÍVEL**. Deseja prosseguir?`)
                .setColor('#FF0000');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`dev_wipe_confirm_${type}_${interaction.user.id}`).setLabel('🚨 Sim, Apagar Tudo').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`dev_wipe_cancel_${type}_${interaction.user.id}`).setLabel('❌ Cancelar').setStyle(ButtonStyle.Secondary)
            );

            // Responde de forma "ephemeral" (só você vê) para não assustar os membros do chat
            return interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });
        }


        // ==========================================
        // 3. CONSTRUÇÃO DOS POP-UPS (MODAIS)
        // ==========================================
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