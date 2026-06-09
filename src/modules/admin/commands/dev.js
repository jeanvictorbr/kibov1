import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateDevDashboard } from '../../../utils/canvasDev.js';

export default {
    name: 'dev',
    execute: async (message, args, client, reply, targetUser) => {
        // Bloqueio de segurança implacável
        if (message.author.id !== process.env.DEVELOPER_ID) {
            return message.reply('❌ **Acesso Negado.** Este comando é exclusivo do Administrador de Infraestrutura.');
        }

        const subCommand = args[0]?.toLowerCase();

        // CASO 1: Alterar saldo de moedas (kdev add @user 10m)
        if (subCommand === 'add' || subCommand === 'give') {
            const amount = args.find(arg => typeof arg === 'number');
            if (!targetUser || !amount) return reply({ description: 'Uso correto: `kdev add @user <valor>`' });

            await prisma.user.upsert({
                where: { userId: targetUser.id },
                update: { balance: { increment: amount } },
                create: { userId: targetUser.id, balance: amount }
            });

            return reply({ title: ' Injeção de Capital', description: `Foram adicionados **$${amount.toLocaleString()}** na conta de ${targetUser}.` });
        }

        // CASO 2: Remover moedas (kdev remove @user 500k)
        if (subCommand === 'remove' || subCommand === 'take') {
            const amount = args.find(arg => typeof arg === 'number');
            if (!targetUser || !amount) return reply({ description: 'Uso correto: `kdev remove @user <valor>`' });

            await prisma.user.update({
                where: { userId: targetUser.id },
                data: { balance: { decrement: amount } }
            });

            return reply({ title: ' Recolha de Capital', description: `Foram removidos **$${amount.toLocaleString()}** da conta de ${targetUser}.` });
        }

        // CASO 3: Configurar White-Label Remotamente (kdev wl <guildId> <nome> <avatarUrl> <webhookUrl>)
        if (subCommand === 'wl') {
            const targetGuildId = args[1];
            const wlName = args[2];
            const wlAvatar = args[3];
            const wlWebhookUrl = args[4];

            if (!targetGuildId || !wlName || !wlWebhookUrl) {
                return reply({ description: 'Uso correto: `kdev wl <guildId> <nome> <avatarUrl> <webhookUrl>`' });
            }

            await prisma.guildConfig.upsert({
                where: { guildId: targetGuildId },
                update: { wlActive: true, wlName, wlAvatar, wlWebhookUrl },
                create: { guildId: targetGuildId, wlActive: true, wlName, wlAvatar, wlWebhookUrl }
            });

            return reply({ title: ' White-Label Ativado', description: `Servidor \`${targetGuildId}\` agora responde como **${wlName}**.` });
        }

        // CASO DEFAULT: Se rodar apenas "kdev", gera o painel visual
        try {
            // Agregadores do Banco de Dados para alimentar as estatísticas do Canvas
            const totalUsers = await prisma.user.count();
            const sumAggregate = await prisma.user.aggregate({ _sum: { balance: true } });
            const globalBalance = sumAggregate._sum.balance || 0;

            const buffer = await generateDevDashboard(client, totalUsers, globalBalance);
            const attachment = new AttachmentBuilder(buffer, { name: 'dev_dashboard.png' });

            await message.channel.send({ files: [attachment] });
        } catch (err) {
            console.error("Erro ao gerar painel dev:", err);
            message.reply('Houve um erro ao desenhar o painel técnico.');
        }
    }
};