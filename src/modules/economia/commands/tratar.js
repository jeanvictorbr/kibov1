import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';

const VALOR_PADRAO = 5000;

export default {
    name: 'tratar',
    execute: async (message, args, client, reply, targetUser) => {
        const userId = message.author.id;

        const userDb = await prisma.user.findUnique({ where: { userId } });
        if (userDb?.currentJob !== 'medico') {
            return message.reply('🩺 Só quem é **Médico** pode costurar ferido! Usa `k trabalhar` e escolhe a jaleca.');
        }

        if (!targetUser) {
            return message.reply('🩺 Marca o ferido que quer tratar! Ex: `k tratar @ferido 8000`');
        }
        if (targetUser.id === userId) {
            return message.reply('🤨 Operar a si mesmo? Isso é coisa de filme, chefe. Marca outro mordido!');
        }
        if (targetUser.bot) {
            return message.reply('🤖 O Kibo não se machuca, a fiação é resistente.');
        }

        const ferido = await prisma.cooldown.findUnique({
            where: { userId_command: { userId: targetUser.id, command: 'ferido' } }
        });
        if (!ferido || ferido.expiresAt < new Date()) {
            return message.reply(`✅ O <@${targetUser.id}> tá zerinho da silva! Não tem ferida pra você tratar.`);
        }

        const valor = args.find(a => typeof a === 'number') || VALOR_PADRAO;
        if (valor <= 0) {
            return message.reply('💸 Valor inválido! Manda um preço justo: `k tratar @ferido 8000`');
        }

        const cliente = await prisma.user.findUnique({ where: { userId: targetUser.id } });
        if (!cliente || cliente.balance < valor) {
            return message.reply(`❌ O <@${targetUser.id}> não tem **$${valor.toLocaleString('pt-BR')}** na carteira pra pagar o tratamento!`);
        }

        const embed = new EmbedBuilder()
            .setTitle('🩺 PROPOSTA DE TRATAMENTO')
            .setDescription(`Aí <@${targetUser.id}>, você tá todo moído da última treta e o <@${userId}> tem o kit de socorro completo!\n\n💸 **Valor do atendimento:** **$${valor.toLocaleString('pt-BR')}**\n\nAceita a injeção de antibiótico (com direito a curativo grátis)?`)
            .setColor('#00E5FF');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`servico_invite_tratar_${valor}_${targetUser.id}_${userId}_aceitar`).setLabel('✅ Quero o curativo').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`servico_invite_tratar_${valor}_${targetUser.id}_${userId}_recusar`).setLabel('❌ Vou na fé').setStyle(ButtonStyle.Danger)
        );

        return message.channel.send({
            content: `<@${targetUser.id}>, o médico da quebrada tá com um curativo pra você!`,
            embeds: [embed],
            components: [row]
        });
    }
};
