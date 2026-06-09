import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateSlotCanvas, SLOTS } from '../../../utils/canvasTigrinho.js';

// Rolos viciados (RTP): Tem muito mais cereja do que Tigre
const REEL = [
    'CEREJA', 'CEREJA', 'CEREJA', 'CEREJA', 'CEREJA', 
    'LIMÃO', 'LIMÃO', 'LIMÃO', 'LIMÃO',
    'UVA', 'UVA', 'UVA', 
    'SINO', 'SINO', 
    'DIMA', 
    'TIGRE' // Só 1 tigre na roleta! Raro!
];

function getRandomSymbol() {
    return REEL[Math.floor(Math.random() * REEL.length)];
}

export default {
    customId: 'tig_action', // O sistema captura os cliques aqui
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const action = parts[2]; // down, up, spin, exit
        let currentBet = parseInt(parts[3]); // Aposta atual
        const ownerId = parts[4]; // Dono da máquina

        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: '🚫 Essa máquina já está sendo usada. Use `k tigrinho` para abrir a sua!', ephemeral: true });
        }

        // --- AÇÃO: SAIR ---
        if (action === 'exit') {
            return interaction.update({ content: '🏃 Você saiu da máquina.', files: [], components: [] });
        }

        // --- AÇÃO: AUMENTAR/DIMINUIR APOSTA ---
        if (action === 'up') currentBet *= 2;
        if (action === 'down') currentBet = Math.max(100, Math.floor(currentBet / 2)); // Mínimo 100

        // Se só mudou a aposta, atualiza os botões (sem girar)
        if (action === 'up' || action === 'down') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`tig_action_down_${currentBet}_${ownerId}`).setLabel('➖ Diminuir').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`tig_action_spin_${currentBet}_${ownerId}`).setLabel(`🎰 GIRAR ($${currentBet})`).setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`tig_action_up_${currentBet}_${ownerId}`).setLabel('➕ Aumentar').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId(`tig_action_exit_0_${ownerId}`).setLabel('🏃 Sair').setStyle(ButtonStyle.Danger)
            );
            return interaction.update({ components: [row] });
        }

        // --- AÇÃO: GIRAR (SPIN) ---
        if (action === 'spin') {
            const userDb = await prisma.user.findUnique({ where: { userId: ownerId } });
            
            if (userDb.balance < currentBet) {
                return interaction.reply({ content: '❌ Você não tem dinheiro suficiente na carteira para essa aposta!', ephemeral: true });
            }

            // Cobra a aposta do usuário
            await prisma.user.update({ where: { userId: ownerId }, data: { balance: { decrement: currentBet } } });

            // 1. Gera a grade 3x3 aleatória
            const grid = [
                [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
                [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
                [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
            ];

            // 2. Calcula as linhas vendscedoras (3 Horizontais, 2 Diagonais)
            let totalWin = 0;
            const lines = [
                [grid[0][0], grid[0][1], grid[0][2]], // Linha 1
                [grid[1][0], grid[1][1], grid[1][2]], // Linha 2
                [grid[2][0], grid[2][1], grid[2][2]], // Linha 3
                [grid[0][0], grid[1][1], grid[2][2]], // Diagonal \
                [grid[2][0], grid[1][1], grid[0][2]]  // Diagonal /
            ];

            for (const line of lines) {
                // Se os três forem iguais
                if (line[0] === line[1] && line[1] === line[2]) {
                    const symbol = line[0];
                    const multiplier = SLOTS[symbol].mult;
                    totalWin += (currentBet * multiplier);
                }
            }

            // Paga o prêmio se houver ganho
            if (totalWin > 0) {
                await prisma.user.update({ where: { userId: ownerId }, data: { balance: { increment: totalWin } } });
            }

            // 3. Atualiza a imagem com o resultado do giro
            const buffer = await generateSlotCanvas(grid, currentBet, totalWin, false);
            const attachment = new AttachmentBuilder(buffer, { name: 'slot.png' });

            // Recria os botões mantendo a aposta atual
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`tig_action_down_${currentBet}_${ownerId}`).setLabel('➖').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`tig_action_spin_${currentBet}_${ownerId}`).setLabel(`🎰 GIRAR NOVAMENTE`).setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`tig_action_up_${currentBet}_${ownerId}`).setLabel('➕').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId(`tig_action_exit_0_${ownerId}`).setLabel('🏃 Sair').setStyle(ButtonStyle.Danger)
            );

            let msgExtra = totalWin > 0 ? `🎉 **GRANDE VITÓRIA!** Você ganhou **$${totalWin.toLocaleString()}**!` : '💸 Que pena, não formou linha. Tente novamente!';

            return interaction.update({ 
                content: msgExtra,
                files: [attachment], 
                components: [row] 
            });
        }
    }
};