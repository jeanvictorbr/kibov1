import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import os from 'os';

export default {
    name: 'dev',
    execute: async (message) => {
        // Trava de segurança: substitua pelo seu ID de desenvolvedor principal
        const DEV_IDS = ['SEU_ID_AQUI', message.author.id]; 
        if (!DEV_IDS.includes(message.author.id)) return;

        // 1. Coleta estatísticas do sistema
        const totalServers = message.client.guilds.cache.size;
        const totalUsers = message.client.users.cache.size;
        
        // Uso de Memória
        const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const memoryTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        
        // Uptime formatado
        const totalSeconds = (message.client.uptime / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const uptimeString = `${days}d ${hours}h ${minutes}m`;

        // 2. Busca dados no banco para o relatório
        const totalMoneyDb = await prisma.user.aggregate({ _sum: { balance: true, bank: true } });
        const totalKiboCashDb = await prisma.user.aggregate({ _sum: { kiboCash: true } });
        const totalBusinesses = await prisma.userBusiness.count();

        const somaTotalMoeda = (totalMoneyDb._sum.balance || 0) + (totalMoneyDb._sum.bank || 0);

        // 3. Top Guildas por número de membros (Proxy de relevância)
        const topGuilds = message.client.guilds.cache
            .sort((a, b) => b.memberCount - a.memberCount)
            .first(5)
            .map((g, i) => `${i + 1}. **${g.name}** (${g.memberCount} membros)`)
            .join('\n') || 'Nenhum servidor encontrado.';

        const embed = new EmbedBuilder()
            .setTitle('⚙️ PAINEL DE CONTROLE SUPREMO • KIBO DEVELOPER')
            .setColor('#FF0055')
            .setThumbnail(message.client.user.displayAvatarURL())
            .addFields(
                { 
                    name: '📊 STATUS OPERACIONAL', 
                    value: `🖥️ **Servidores:** ${totalServers}\n👥 **Usuários em Cache:** ${totalUsers}\n⏳ **Uptime:** \`${uptimeString}\`\n🧠 **Memória RAM:** \`${memoryUsed} MB\` / ${Math.round(memoryTotal)} GB`, 
                    inline: true 
                },
                { 
                    name: '💰 VOLUME ECONÔMICO', 
                    value: `💵 **Total Economia:** $${somaTotalMoeda.toLocaleString()}\n💎 **Total KiboCash:** $${(totalKiboCashDb._sum.kiboCash || 0).toLocaleString()}\n🏢 **Empresas Ativas:** ${totalBusinesses}`, 
                    inline: true 
                },
                { 
                    name: '🏆 TOP GUILDAS (Por População)', 
                    value: topGuilds, 
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ text: 'Ações de Wipe são irreversíveis! Use com cuidado extremo.' });

        // Botões de Acionamento do Wipe (Mandam o sinal para o componente)
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`dev_wipe_trigger_money_${message.author.id}`).setLabel('Wipe: Dinheiro').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`dev_wipe_trigger_kibocash_${message.author.id}`).setLabel('Wipe: KiboCash').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`dev_wipe_trigger_business_${message.author.id}`).setLabel('Wipe: Empresas').setStyle(ButtonStyle.Danger)
        );

        await message.reply({ embeds: [embed], components: [row] });
    }
};