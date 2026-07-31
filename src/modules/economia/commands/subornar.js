import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    name: 'subornar',
    execute: async (message, args, client, reply, targetUser) => {
        const robberId = message.author.id;
        const guildId = message.guild.id;

        // 1. Verifica se o maluco tá preso mesmo
        const jailCooldown = await prisma.cooldown.findUnique({
            where: { userId_command: { userId: robberId, command: 'preso' } }
        });

        if (!jailCooldown || jailCooldown.expiresAt < new Date()) {
            return message.reply('🕊️ Tá chapando, truta? Cê tá livre na rua. Vai subornar o vento?');
        }

        // 2. Acha o alvo (Polícia) e o valor do desenrolo
        if (!targetUser) {
            return message.reply('🚓 Você precisa marcar o PM que quer comprar! Ex: `k subornar @policial 50000`');
        }

        if (targetUser.id === robberId) {
            return message.reply('🤨 Subornar a si mesmo? O xilindró já derreteu seu cérebro, chefe.');
        }

        if (targetUser.bot) {
            return message.reply('🤖 O Kibo é 100% incorruptível, maluco! Fica na sua e cumpre a pena.');
        }

        // O motor pega os argumentos limpos. Vamos achar onde tá o número (o valor da propina)
        const bribeAmount = args.find(arg => typeof arg === 'number');
        if (!bribeAmount || bribeAmount <= 0) {
            return message.reply('💸 Qual é o valor do desenrolo? Manda a proposta em dinheiro! Ex: `k subornar @policial 50000`');
        }

        // 3. Verifica se o alvo realmente é Polícia nessa cidade
        const copDb = await prisma.user.findUnique({ where: { userId: targetUser.id } });
        if (!copDb || copDb.currentJob !== 'policial') {
            return message.reply('❌ O mano nem é da PM! Você tá oferecendo dinheiro pra civil à toa.');
        }

        const hasBadge = await prisma.policeBadge.findUnique({
            where: { userId_guildId: { userId: targetUser.id, guildId } }
        });

        if (!hasBadge) {
            return message.reply('🛑 Esse PM aí é de outra quebrada, não tem a chave da sua cela não!');
        }

        // 4. Verifica se o ladrão tem a grana viva na mão
        const robberDb = await prisma.user.findUnique({ where: { userId: robberId } });
        if (!robberDb) {
            return message.reply('❌ Seu registro no submundo tá sumido do sistema! Dá um `k perfil` pra se registrar.');
        }
        if (robberDb.balance < bribeAmount) {
            return message.reply(`❌ Você não tem **$${bribeAmount.toLocaleString('pt-BR')}** na carteira pra bancar esse suborno!`);
        }

        // 5. Monta a proposta pro PM
        const embed = new EmbedBuilder()
            .setTitle('💼 DESENROLO NO XILINDRÓ!')
            .setDescription(`Aí <@${targetUser.id}>, o preso <@${robberId}> te chamou na grade e mandou o papo reto.\n\nEle tá oferecendo **💰 $${bribeAmount.toLocaleString('pt-BR')}** limpos na sua mão pra você fingir que não viu nada e abrir a cela.\n\nE aí, Oficial? Vai pegar a grana ou manter a conduta?`)
            .setColor('#FFD700')
            .setThumbnail('https://i.imgur.com/kO1p5z0.png');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('subornar_action_aceitar')
                .setLabel('💸 Pegar a Grana')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('subornar_action_recusar')
                .setLabel('🛑 Recusar e Punir')
                .setStyle(ButtonStyle.Danger)
        );

        const msg = await message.channel.send({ content: `<@${targetUser.id}>, encosta aqui! Tem proposta pra você.`, embeds: [embed], components: [row] });

        // Registra o desenrolo pra o componente subornar_action resolver (sem conflito de collector)
        global.activeSuborno = global.activeSuborno || new Map();
        global.activeSuborno.set(msg.id, { robberId, copId: targetUser.id, bribeAmount, guildId });

        // Limpeza: se o PM não responder em 60s, o desenrolo mela
        setTimeout(() => {
            global.activeSuborno?.delete(msg.id);
            msg.edit({ content: '⏳ O PM demorou pra decidir e o carcereiro chefe passou no corredor. O desenrolo melou e os dois ficaram quietos!', components: [] }).catch(() => {});
        }, 60000);
    }
};