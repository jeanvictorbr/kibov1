import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { hasActiveCooldown } from '../../../utils/buffService.js';

const VALOR_PADRAO = 20000;
const DURACAO_MIN = 30;

export default {
    name: 'segurar',
    execute: async (message, args, client, reply, targetUser) => {
        const userId = message.author.id;

        const userDb = await prisma.user.findUnique({ where: { userId } });
        if (userDb?.currentJob !== 'seguranca') {
            return message.reply('👮 Só quem é **Segurança Privado** pode blindar cliente! Usa `k trabalhar`.');
        }

        if (!targetUser) {
            return message.reply('👮 Marca quem quer proteger! Ex: `k segurar @cliente 25000`');
        }
        if (targetUser.id === userId) {
            return message.reply('🤨 Se proteger sozinho? Tu é o segurança, não o protegido, chefe.');
        }
        if (targetUser.bot) {
            return message.reply('🤖 O Kibo é blindado de fábrica, dispensa escolta.');
        }

        if (await hasActiveCooldown(targetUser.id, 'protegido')) {
            return message.reply(`🛡️ O <@${targetUser.id}> já tá sob escolta de outro segurança! Ninguém metralha dois capangas no mesmo quarteirão.`);
        }

        const valor = args.find(a => typeof a === 'number') || VALOR_PADRAO;
        if (valor <= 0) {
            return message.reply('💸 Valor inválido! Manda o cachê: `k segurar @cliente 25000`');
        }

        const cliente = await prisma.user.findUnique({ where: { userId: targetUser.id } });
        if (!cliente || cliente.balance < valor) {
            return message.reply(`❌ O <@${targetUser.id}> não tem **$${valor.toLocaleString('pt-BR')}** na carteira pra contratar sua proteção!`);
        }

        const embed = new EmbedBuilder()
            .setTitle('👮 PROPOSTA DE SEGURANÇA')
            .setDescription(`Aí <@${targetUser.id}>, tem uma galera querendo sua carteira e o <@${userId}> se ofereceu pra ficar de olho!\n\n🛡️ **Duração:** ${DURACAO_MIN} minutos blindado contra assalto\n💸 **Cachê da escolta:** **$${valor.toLocaleString('pt-BR')}**\n\nAceita a proteção?`)
            .setColor('#FFB300');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`servico_invite_segurar_${valor}_${targetUser.id}_${userId}_aceitar`).setLabel('✅ Quero a escolta').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`servico_invite_segurar_${valor}_${targetUser.id}_${userId}_recusar`).setLabel('❌ Me viro sozinho').setStyle(ButtonStyle.Danger)
        );

        return message.channel.send({
            content: `<@${targetUser.id}>, tem um segurança pronto pra te blindar!`,
            embeds: [embed],
            components: [row]
        });
    }
};
