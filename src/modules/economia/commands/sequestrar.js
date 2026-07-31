import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { hasActiveCooldown } from '../../../utils/buffService.js';

// Saldo mínimo pra vítima valer o sequestro
const MIN_SALDO = 30000;
// Tempo que a vítima tem pra decidir
const TEMPO = 60000;

export default {
    name: 'sequestrar',
    execute: async (message, args, client, reply, targetUser) => {
        const kidId = message.author.id;
        const guildId = message.guild.id;

        const kidDb = await prisma.user.findUnique({ where: { userId: kidId } });
        if (kidDb?.currentJob !== 'sequestrador') {
            return message.reply('🧨 Só quem é **Sequestrador** sabe puxar o cara pro cativeiro! Usa `k trabalhar`.');
        }

        if (!targetUser) {
            return message.reply('🧨 Marca a vítima! Ex: `k sequestrar @user`');
        }
        if (targetUser.id === kidId) {
            return message.reply('🤨 Sequestrar a si mesmo? Tu tem algum problema, chefe?');
        }
        if (targetUser.bot) {
            return message.reply('🤖 O Kibo não tem família que pague resgate.');
        }
        if (await hasActiveCooldown(kidId, 'ferido')) {
            return message.reply('🤕 Tá todo moído da última treta! Nem sequestrar em cadeira de rodas dá.');
        }

        // Cooldown do sequestrador (30 min)
        const cd = await prisma.cooldown.findUnique({
            where: { userId_command: { userId: kidId, command: 'sequestrar' } }
        });
        if (cd && cd.expiresAt > new Date()) {
            const minutos = Math.ceil((cd.expiresAt - new Date()) / 60000);
            return message.reply(`⏳ O morro tá na sua cola depois do último sequestro! Espera mais **${minutos} minutos** pra armar outro.`);
        }

        const targetDb = await prisma.user.findUnique({ where: { userId: targetUser.id } });
        if (!targetDb || targetDb.balance < MIN_SALDO) {
            return message.reply(`🕸️ Essa vítima é pão-dura! Sequestro só vale pra quem tem **$${MIN_SALDO.toLocaleString('pt-BR')}+** na conta.`);
        }

        const preso = await prisma.cooldown.findUnique({
            where: { userId_command: { userId: targetUser.id, command: 'preso' } }
        });
        if (preso && preso.expiresAt > new Date()) {
            return message.reply('🤨 A vítima já tá em Alcatraz, sequestrar preso é trabalho dobrado e sem pagamento!');
        }

        // Resgate: 25% do saldo (mín. 10k)
        const resgate = Math.max(10000, Math.floor(targetDb.balance * 0.25));

        // Ativa o cooldown do sequestrador
        await prisma.cooldown.upsert({
            where: { userId_command: { userId: kidId, command: 'sequestrar' } },
            update: { expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
            create: { userId: kidId, command: 'sequestrar', expiresAt: new Date(Date.now() + 30 * 60 * 1000) }
        });

        const embed = new EmbedBuilder()
            .setTitle('🧨 SEQUESTRO EM ANDAMENTO!')
            .setDescription(`O <@${kidId}> meteu a mão no **<@${targetUser.id}>** no meio da rua e jogou ele num cativeiro na quebrada!\n\n💵 **Resgate:** **$${resgate.toLocaleString('pt-BR')}**\n\nO <@${targetUser.id}> tem **${TEMPO / 1000} segundos** pra decidir: paga pra sair inteiro ou chama a ROTA pra dar tiro!`)
            .setColor('#FF0000');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('seq_action_pagar').setLabel(`💰 Pagar $${resgate.toLocaleString('pt-BR')}`).setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('seq_action_rota').setLabel('🚨 Chamar a ROTA').setStyle(ButtonStyle.Danger)
        );

        const msg = await message.channel.send({
            content: `🚨 **ALERTA DE SEQUESTRO!** O <@${targetUser.id}> foi pego no beco!`,
            embeds: [embed],
            components: [row]
        });

        // Registra o sequestro pra o componente seq_action resolver (sem conflito de collector)
        global.activeSequestro = global.activeSequestro || new Map();
        global.activeSequestro.set(msg.id, { kidId, targetId: targetUser.id, resgate, guildId });

        // Limpeza: se a vítima não responder em 60s, o sequestrador solta
        setTimeout(() => {
            global.activeSequestro?.delete(msg.id);
            msg.edit({
                content: '⏳ A vítima não respondeu a tempo e o sequestrador soltou ela no meio da rua, mais leve que o bolso dele.',
                components: []
            }).catch(() => {});
        }, TEMPO);
    }
};
