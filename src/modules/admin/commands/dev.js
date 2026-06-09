import { ActionRowBuilder, StringSelectMenuBuilder, AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateDevDashboard } from '../../../utils/canvasDev.js';

export default {
    name: 'dev',
    execute: async (message, args, client, reply, targetUser) => {
        // Trava de segurança intransponível
        if (message.author.id !== process.env.DEVELOPER_ID) {
            return message.reply('❌ **Acesso restrito.** Painel exclusivo do dono da infraestrutura.');
        }

        try {
            // Manda uma mensagem de aviso para dar tempo ao Canvas de gerar
            const msg = await message.reply('⚙️ A carregar a Central de Comando Kibo...');

            // Agregações de banco de dados para o seu gráfico
            const totalUsers = await prisma.user.count();
            const sumAggregate = await prisma.user.aggregate({ _sum: { balance: true } });
            const globalBalance = sumAggregate._sum.balance || 0;

            // Gera a sua arte com a sua foto!
            const buffer = await generateDevDashboard(client, totalUsers, globalBalance, message.author);
            const attachment = new AttachmentBuilder(buffer, { name: 'kibo_dashboard.png' });

            // Cria o Menu Interativo
            const menu = new StringSelectMenuBuilder()
                .setCustomId('dev_menu')
                .setPlaceholder('⚙️ Selecione uma ação de gestão...')
                .addOptions([
                    { label: 'Ver Servidores Ativos', description: 'Lista todos os servidores do Kibo.', value: 'servers', emoji: '🌐' },
                    { label: 'Informações de um Servidor', description: 'Ver dados de uma guilda.', value: 'server_info', emoji: '🏰' },
                    { label: 'Expulsar Bot de Servidor', description: 'Remove o Kibo de um servidor.', value: 'leave_guild', emoji: '🚪' },
                    { label: 'Injetar Capital', description: 'Adicionar moedas a um usuário.', value: 'add_money', emoji: '💰' },
                    { label: 'Recolher Capital', description: 'Remover moedas de um usuário.', value: 'remove_money', emoji: '💸' },
                    { label: 'Banir Usuário', description: 'Bloqueia totalmente o uso do bot.', value: 'ban_user', emoji: '🔨' },
                    { label: 'Desbanir Usuário', description: 'Restaura o acesso ao bot.', value: 'unban_user', emoji: '✅' },
                    { label: 'Sistema White-Label', description: 'Configurar Webhook fantasma.', value: 'set_wl', emoji: '👻' }
                ]);

            const row = new ActionRowBuilder().addComponents(menu);

            // Edita a mensagem com a imagem e o menu
            await msg.edit({ content: null, files: [attachment], components: [row] });
        } catch (err) {
            console.error("Erro no k dev:", err);
            message.reply('Houve um erro técnico ao renderizar o painel.');
        }
    }
};