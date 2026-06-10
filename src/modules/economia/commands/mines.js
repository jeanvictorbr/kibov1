import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { parseAmount } from '../../../utils/parseAmount.js';

// Usaremos a memória RAM para guardar o estado do jogo e não dar lag no banco de dados
if (!global.minesGames) global.minesGames = new Map();

export default {
    name: 'mines',
    execute: async (message, args) => {
        const userId = message.author.id;

        // Trava: Impede o jogador de abrir vários jogos ao mesmo tempo
        if (global.minesGames.has(userId)) {
            return message.reply('❌ Você já tem uma partida de Mines em andamento! Jogue-a ou clique em Retirar primeiro.');
        }

        const bet = parseAmount(args[0]);
        const minesCount = parseInt(args[1]) || 3; // Se o cara não digitar a quantidade, o padrão é 3

        if (isNaN(bet) || bet <= 0) return message.reply('**Uso correto:** `k mines [aposta] [numero_de_minas]`\nExemplo: `k mines 1k 5`');
        if (minesCount < 1 || minesCount > 19) return message.reply('❌ Você precisa escolher entre **1 e 19 minas**.');

        const userDb = await prisma.user.findUnique({ where: { userId } });
        if (!userDb || userDb.balance < bet) return message.reply('❌ Dinheiro insuficiente na carteira, chefe!');

        // Cobra a aposta imediatamente no banco de dados
        await prisma.user.update({ where: { userId }, data: { balance: { decrement: bet } } });

        // Gera o tabuleiro 5x4 (20 espaços totais)
        const totalSpaces = 20;
        let board = Array(totalSpaces).fill('safe');
        for (let i = 0; i < minesCount; i++) board[i] = 'mine';

        // Mistura o tabuleiro usando o algoritmo Fisher-Yates
        for (let i = board.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [board[i], board[j]] = [board[j], board[i]];
        }

        // Salva a partida na memória RAM
        global.minesGames.set(userId, {
            ownerId: userId,
            bet,
            minesCount,
            board,
            clicks: 0,
            multiplier: 1.00,
            revealed: Array(totalSpaces).fill(false)
        });

        // Constrói os 20 botões do grid (4 linhas x 5 colunas)
        const components = [];
        for (let i = 0; i < 4; i++) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < 5; j++) {
                const index = (i * 5) + j;
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`mines_action_click_${userId}_${index}`)
                        .setLabel('❓')
                        .setStyle(ButtonStyle.Secondary)
                );
            }
            components.push(row);
        }

        // A 5ª linha é o botão de Cashout (Começa desativado até ele clicar na 1ª pedra)
        const painelRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`mines_action_cashout_${userId}`)
                .setLabel(`💰 RETIRAR: $${bet.toLocaleString()} (1.00x)`)
                .setStyle(ButtonStyle.Success)
                .setDisabled(true) 
        );
        components.push(painelRow);

        await message.reply({
            content: `# 💣 KIBO MINES\n**Aposta:** $${bet.toLocaleString()} | **Minas:** ${minesCount}\nEncontre os diamantes para multiplicar o valor!`,
            components
        });
    }
};