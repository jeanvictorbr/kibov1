import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { parseAmount } from '../../../utils/parseAmount.js';

export default {
    name: 'coinflip',
    execute: async (message, args, client, reply, targetUser) => {
        const amount = parseAmount(args[1] || args[0]);

        if (!targetUser || isNaN(amount) || amount <= 0) {
            return message.reply('**Uso correto:** `k coinflip @usuario valor` ou responda à pessoa com `k coinflip valor`.');
        }

        if (targetUser.id === message.author.id) {
            return message.reply('**Chefe, você não pode apostar contra o espelho! Escolha outro jogador.**');
        }

        if (targetUser.bot) {
            return message.reply('**Bots não têm dinheiro, chefe. Aposte com humanos!**');
        }

        // Verifica o saldo do desafiante (Quem envia o comando)
        const challenger = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (!challenger || challenger.balance < amount) {
            return message.reply(`**Você não tem $${amount.toLocaleString('pt-BR')} na carteira para bancar essa aposta!**`);
        }

        // Cria o desafio (botões de Aceitar/Recusar)
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`cf_action_accept_${message.author.id}_${targetUser.id}_${amount}`)
                .setLabel('Aceitar Aposta')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`cf_action_decline_${message.author.id}_${targetUser.id}_${amount}`)
                .setLabel('Arregar (Recusar)')
                .setStyle(ButtonStyle.Danger)
        );

        await message.reply({
            content: `# 🪙 DESAFIO MORTAL!\n<@${message.author.id}> está a desafiar <@${targetUser.id}> para rodar a moeda!\n\n💰 **Valor em jogo:** $${amount.toLocaleString('pt-BR')} (de cada)\n📉 *Taxa do Kibo Bank:* 2% sobre o montante final\n\n<@${targetUser.id}>, você vai aceitar ou vai arregar?`,
            components: [row]
        });
    }
};