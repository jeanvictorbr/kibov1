import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } from 'discord.js';
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
                .setCustomId('aceitar_suborno')
                .setLabel('💸 Pegar a Grana')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('recusar_suborno')
                .setLabel('🛑 Recusar e Punir')
                .setStyle(ButtonStyle.Danger)
        );

        const msg = await message.channel.send({ content: `<@${targetUser.id}>, encosta aqui! Tem proposta pra você.`, embeds: [embed], components: [row] });

        // 6. Espera a resposta SÓ do Policial por 60 segundos
        const filter = (i) => i.user.id === targetUser.id;
        const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async (i) => {
            // TRAVA DE TEMPO: Avisa o Discord instantaneamente que estamos processando a resposta
            await i.deferUpdate().catch(() => {});

            // Segurança dupla: verifica se o cara ainda tá preso e se tem o dinheiro
            const checkRobber = await prisma.user.findUnique({ where: { userId: robberId } });
            const checkJail = await prisma.cooldown.findUnique({ where: { userId_command: { userId: robberId, command: 'preso' } } });

            if (!checkJail || checkJail.expiresAt < new Date()) {
                await i.editReply({ content: '⏳ Tarde demais! O cara já fugiu ou a pena acabou.', embeds: [], components: [] });
                return collector.stop();
            }

            if (checkRobber.balance < bribeAmount) {
                await i.editReply({ content: '🤡 O vagabundo tentou dar o calote! Prometeu a grana mas a carteira tá vazia. Negócio cancelado!', embeds: [], components: [] });
                return collector.stop();
            }

            if (i.customId === 'aceitar_suborno') {
                // CORRUPÇÃO CONCLUÍDA
                await prisma.$transaction([
                    prisma.user.update({ where: { userId: robberId }, data: { balance: { decrement: bribeAmount } } }),
                    prisma.user.update({ where: { userId: targetUser.id }, data: { balance: { increment: bribeAmount } } }),
                    prisma.cooldown.delete({ where: { userId_command: { userId: robberId, command: 'preso' } } }) // Apaga a pena!
                ]);

                const embedAceitou = new EmbedBuilder()
                    .setTitle('🤝 NEGÓCIO FECHADO!')
                    .setDescription(`O Oficial <@${targetUser.id}> olhou pros dois lados, guardou os **$${bribeAmount.toLocaleString('pt-BR')}** na bota e destrancou a porta.\n\n🔓 O <@${robberId}> tá solto na rua de novo! O sistema é sujo!`)
                    .setColor('#00FF00');

                // Atualizado para editReply
                await i.editReply({ content: '💸 Fechou no sigilo.', embeds: [embedAceitou], components: [] });

            } else if (i.customId === 'recusar_suborno') {
                // POLÍCIA RECUSOU (Sorteia punição de 2 a 8 minutos)
                const penaExtra = Math.floor(Math.random() * (8 - 2 + 1)) + 2;
                const novaPena = new Date(checkJail.expiresAt.getTime() + penaExtra * 60 * 1000); 
                
                await prisma.cooldown.update({
                    where: { userId_command: { userId: robberId, command: 'preso' } },
                    data: { expiresAt: novaPena }
                });

                const embedRecusou = new EmbedBuilder()
                    .setTitle('🛑 PM INCORRUPTÍVEL!')
                    .setDescription(`O Oficial <@${targetUser.id}> deu risada da cara do <@${robberId}>, recusou a grana e bateu com o cacetete na grade!\n\n⚖️ **Punição:** O juiz sorteou mais **+${penaExtra} Minutos** na pena por tentativa de suborno!`)
                    .setColor('#FF0000');

                // Atualizado para editReply
                await i.editReply({ content: '👮 A lei não tá à venda, chefe!', embeds: [embedRecusou], components: [] });
            }

            collector.stop();
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                await msg.edit({ content: '⏳ O PM demorou pra decidir e o carcereiro chefe passou no corredor. O desenrolo melou e os dois ficaram quietos!', components: [] }).catch(() => {});
            }
        });
    }
};