import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { parseAmount } from '../../../utils/parseAmount.js'; // Nosso conversor (k, kk)

export default {
    name: 'airdrop',
    execute: async (message, args) => {
        const userId = message.author.id;

        // 1. Lê e Valida o Valor
        const amount = parseAmount(args[0]);

        if (isNaN(amount) || amount < 10000) {
            return message.reply('**Chefe, airdrop de miséria não rola!** O valor mínimo para uma Chuva de PIX é **$10.000**.\nExemplo: `k airdrop 500k`');
        }

        // 2. Verifica se o Magnata tem o dinheiro e já desconta
        const userDb = await prisma.user.findUnique({ where: { userId } });
        
        if (!userDb || userDb.balance < amount) {
            return message.reply(`❌ **Saldo Insuficiente!** Você precisa de **$${amount.toLocaleString('pt-BR')}** na CARTEIRA para ostentar dessa forma.`);
        }

        await prisma.user.update({ 
            where: { userId }, 
            data: { balance: { decrement: amount } } 
        });

        // 3. Monta o Anúncio do Airdrop
        const embed = new EmbedBuilder()
            .setTitle('🌧️ CHUVA DE PIX INICIADA! 🌧️')
            .setDescription(`O magnata <@${userId}> acabou de jogar **$${amount.toLocaleString('pt-BR')}** para o alto!\n\n**Como funciona:** Clique no botão abaixo para tentar apanhar o dinheiro. O valor total será dividido igualmente entre todos os que clicarem a tempo.\n\n⏳ **Faltam 60 segundos!**`)
            .setColor('#FFD700')
            .setThumbnail(message.author.displayAvatarURL());

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`airdrop_claim`)
                .setLabel('💰 Clicar para Resgatar!')
                .setStyle(ButtonStyle.Success)
        );

        const airdropMessage = await message.channel.send({ content: '@everyone', embeds: [embed], components: [row] });

        // 4. Cria o Coletor de Cliques (60 segundos)
        const filter = (interaction) => interaction.customId === 'airdrop_claim';
        const collector = airdropMessage.createMessageComponentCollector({ filter, time: 60000 });

        // Usamos um Set para garantir que cada pessoa só receba uma vez, mesmo clicando muito
        const claimers = new Set();

        collector.on('collect', async (interaction) => {
            // O magnata que jogou não pode apanhar o próprio dinheiro
            if (interaction.user.id === userId) {
                return interaction.reply({ content: 'Tira a mão! Você não pode apanhar o seu próprio Airdrop.', ephemeral: true });
            }

            if (claimers.has(interaction.user.id)) {
                return interaction.reply({ content: 'Acalma-te! Já garantiste a tua parte.', ephemeral: true });
            }

            claimers.add(interaction.user.id);
            await interaction.reply({ content: '✅ Conseguiste apanhar parte da Chuva de PIX! Aguarda o fim do tempo para receberes o valor no saldo.', ephemeral: true });
        });

        // 5. Fim do Tempo (Distribui o Dinheiro)
        collector.on('end', async () => {
            // Desativa o botão
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`airdrop_claim`).setLabel('Airdrop Fechado').setStyle(ButtonStyle.Secondary).setDisabled(true)
            );

            if (claimers.size === 0) {
                // Ninguém clicou, o dinheiro volta para o magnata
                await prisma.user.update({ where: { userId }, data: { balance: { increment: amount } } });
                
                const refundEmbed = new EmbedBuilder()
                    .setTitle('🌧️ CHUVA DE PIX CANCELADA!')
                    .setDescription(`Ninguém apareceu para apanhar o dinheiro. Os **$${amount.toLocaleString('pt-BR')}** foram devolvidos ao <@${userId}>.`)
                    .setColor('#FF4444');
                
                return airdropMessage.edit({ embeds: [refundEmbed], components: [disabledRow] });
            }

            // Divide o prêmio de forma justa e redonda
            const splitAmount = Math.floor(amount / claimers.size);
            const winnerList = Array.from(claimers);

            // Injeta o dinheiro na conta de cada ganhador usando transasções no banco
            for (const winnerId of winnerList) {
                // Garante que a pessoa tem conta no banco antes de dar o dinheiro
                await prisma.user.upsert({
                    where: { userId: winnerId },
                    update: { balance: { increment: splitAmount } },
                    create: { userId: winnerId, balance: splitAmount }
                });
            }

            // Anuncia o Resultado
            const resultEmbed = new EmbedBuilder()
                .setTitle('🌧️ CHUVA DE PIX FINALIZADA!')
                .setDescription(`O Airdrop de **$${amount.toLocaleString('pt-BR')}** do magnata <@${userId}> terminou!\n\n**${claimers.size}** jogadores foram rápidos e cada um recebeu **$${splitAmount.toLocaleString('pt-BR')}** na sua carteira!`)
                .setColor('#00FF66');

            await airdropMessage.edit({ embeds: [resultEmbed], components: [disabledRow] });
            await message.channel.send(`🎉 O dinheiro já está na vossa conta! Verifiquem o vosso \`k perfil\`.`);
        });
    }
};