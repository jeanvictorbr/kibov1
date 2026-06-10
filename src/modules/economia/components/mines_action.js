import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    customId: 'mines_action', // Se conecta ao CustomID gerado no comando
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const action = parts[2]; // 'click' ou 'cashout'
        const ownerId = parts[3];

        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: 'Tira a mão, chefe! Essa aposta não é sua!', ephemeral: true });
        }

        const game = global.minesGames?.get(ownerId);
        
        // Se o botão for clicado mas o jogo já tiver sido apagado da memória
        if (!game) {
            return interaction.update({ content: '❌ Essa partida já terminou.', components: [] });
        }

        // ==========================================
        // AÇÃO 1: RETIRAR O DINHEIRO (CASHOUT)
        // ==========================================
        if (action === 'cashout') {
            const lucro = Math.floor(game.bet * game.multiplier);
            
            // Paga o jogador no banco de dados
            await prisma.user.update({ where: { userId: ownerId }, data: { balance: { increment: lucro } } });
            
            // Deleta o jogo da memória RAM para liberar espaço
            global.minesGames.delete(ownerId);

            // Revela onde estavam as bombas que sobraram
            const components = renderBoard(game, true);
            
            return interaction.update({ 
                content: `# ✅ RETIRADA COM SUCESSO!\nVocê fugiu a tempo e lucrou **$${lucro.toLocaleString('pt-BR')}**! (${game.multiplier.toFixed(2)}x)`, 
                components 
            });
        }

        // ==========================================
        // AÇÃO 2: CLICAR NUM ESPAÇO NOVO (CLICK)
        // ==========================================
        if (action === 'click') {
            const index = parseInt(parts[4]);

            // Impede duplo-clique no mesmo botão
            if (game.revealed[index]) return interaction.deferUpdate(); 

            game.revealed[index] = true;

            // CASO A: CLICOU NA BOMBA (DERROTA)
            if (game.board[index] === 'mine') {
                global.minesGames.delete(ownerId); // Apaga o jogo
                const components = renderBoard(game, true, index); // Desenha tudo vermelho

                return interaction.update({
                    content: `# 💥 KABOOM!\nVocê pisou numa bomba e perdeu **$${game.bet.toLocaleString('pt-BR')}**!`,
                    components
                });
            }

            // CASO B: ACHOU O DIAMANTE (SAFE)
            game.clicks += 1;
            
            // Motor de Probabilidade: (Total Restante) / (Total Restante - Bombas)
            let newMult = 1.0;
            for (let i = 0; i < game.clicks; i++) {
                newMult *= (20 - i) / (20 - game.minesCount - i);
            }
            game.multiplier = newMult * 0.98; // Multiplicador oficial com 2% de comissão para a casa

            // Vitória Máxima (Encontrou todos os diamantes do mapa)
            const maxClicks = 20 - game.minesCount;
            if (game.clicks >= maxClicks) {
                const lucro = Math.floor(game.bet * game.multiplier);
                await prisma.user.update({ where: { userId: ownerId }, data: { balance: { increment: lucro } } });
                global.minesGames.delete(ownerId);
                
                return interaction.update({
                    content: `# 🏆 ZEROU O MINES!\nLimpou o mapa inteiro! Você lucrou **$${lucro.toLocaleString('pt-BR')}**! (${game.multiplier.toFixed(2)}x)`,
                    components: renderBoard(game, true)
                });
            }

            // O jogo continua, atualiza os botões mostrando o novo diamante
            return interaction.update({
                content: `# 💣 KIBO MINES\n**Multiplicador:** ${game.multiplier.toFixed(2)}x | **Minas:** ${game.minesCount}`,
                components: renderBoard(game, false)
            });
        }
    }
};

// ==========================================
// FUNÇÃO AUXILIAR: DESENHAR O TABULEIRO
// ==========================================
function renderBoard(game, isGameOver, fatalIndex = -1) {
    const components = [];
    for (let i = 0; i < 4; i++) {
        const row = new ActionRowBuilder();
        for (let j = 0; j < 5; j++) {
            const index = (i * 5) + j;
            
            let label = '❓';
            let style = ButtonStyle.Secondary;
            let disabled = isGameOver;

            // Se o botão foi revelado durante o jogo OU se for Game Over (mostra tudo)
            if (game.revealed[index] || isGameOver) {
                if (game.board[index] === 'mine') {
                    label = '💣';
                    // A bomba que matou o jogador fica vermelha, as outras ocultas ficam cinzas
                    style = (index === fatalIndex) ? ButtonStyle.Danger : ButtonStyle.Secondary;
                } else {
                    label = '💎';
                    style = ButtonStyle.Success; // Verde
                }
            }

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`mines_action_click_${game.ownerId}_${index}`)
                    .setLabel(label)
                    .setStyle(style)
                    .setDisabled(disabled || game.revealed[index])
            );
        }
        components.push(row);
    }

    // A linha do Cashout só aparece se o jogo não tiver acabado
    if (!isGameOver) {
        const lucroAtual = Math.floor(game.bet * game.multiplier);
        const painelRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`mines_action_cashout_${game.ownerId}`)
                .setLabel(`💰 RETIRAR: $${lucroAtual.toLocaleString('pt-BR')} (${game.multiplier.toFixed(2)}x)`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(game.clicks === 0) // Não deixa sacar antes de clicar no primeiro
        );
        components.push(painelRow);
    }

    return components;
}