import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateSlotCanvas, SLOTS } from '../../../utils/canvasTigrinho.js';

// Rolos viciados (RTP): Tem muito mais cereja do que Tigre
const REEL = [
    'cherry', 'cherry', 'cherry', 'cherry', 'cherry', 
    'lemon', 'lemon', 'lemon', 'lemon',
    'grape', 'grape', 'grape', 
    'bell', 'bell', 
    'diamond', 
    'tiger' // Só 1 tigre! Raro!
];

function getRandomSymbol() {
    return REEL[Math.floor(Math.random() * REEL.length)];
}

export default {
    customId: 'tig_action', 
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const action = parts[2]; // down, up, spin, exit
        let currentBet = parseInt(parts[3]); 
        const ownerId = parts[4]; 

        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: '🚫 Essa máquina já está sendo usada. Use `k tigrinho`!', ephemeral: true });
        }

        // --- AÇÃO: SAIR ---
        if (action === 'exit') {
            return interaction.update({ content: '🏃 Você saiu da máquina.', files: [], components: [] });
        }

        // --- AÇÃO: ALTERAR APOSTA ---
        if (action === 'up') currentBet *= 2;
        if (action === 'down') currentBet = Math.max(100, Math.floor(currentBet / 2));

        if (action === 'up' || action === 'down') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`tig_action_down_${currentBet}_${ownerId}`).setLabel('➖').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`tig_action_spin_${currentBet}_${ownerId}`).setLabel(`🎰 GIRAR ($${currentBet})`).setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`tig_action_up_${currentBet}_${ownerId}`).setLabel('➕').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId(`tig_action_exit_0_${ownerId}`).setLabel('🏃 Sair').setStyle(ButtonStyle.Danger)
            );
            return interaction.update({ components: [row] });
        }

        // --- AÇÃO: GIRAR (SPIN) ---
        if (action === 'spin') {
            const userDb = await prisma.user.findUnique({ where: { userId: ownerId } });
            
            if (userDb.balance < currentBet) {
                return interaction.reply({ content: '❌ Você não tem dinheiro suficiente na carteira!', ephemeral: true });
            }

            // Cobra a aposta
            await prisma.user.update({ where: { userId: ownerId }, data: { balance: { decrement: currentBet } } });

            // 1. Gera a grade 3x3 aleatória (Chaves)
            const gridKeys = [
                [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
                [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
                [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
            ];

            // 2. Calcula Ganho
            let totalWin = 0;
            const lines = [
                [gridKeys[0][0], gridKeys[0][1], gridKeys[0][2]], // Horiz 1
                [gridKeys[1][0], gridKeys[1][1], gridKeys[1][2]], // Horiz 2
                [gridKeys[2][0], gridKeys[2][1], gridKeys[2][2]], // Horiz 3
                [gridKeys[0][0], gridKeys[1][1], gridKeys[2][2]], // Diag \
                [gridKeys[2][0], gridKeys[1][1], gridKeys[0][2]]  // Diag /
            ];

            for (const line of lines) {
                // Compara as chaves: tiger === tiger === tiger
                if (line[0] === line[1] && line[1] === line[2]) {
                    const symbolKey = line[0];
                    const multiplier = SLOTS[symbolKey].mult;
                    totalWin += (currentBet * multiplier);
                }
            }

            // Paga o prêmio
            if (totalWin > 0) {
                await prisma.user.update({ where: { userId: ownerId }, data: { balance: { increment: totalWin } } });
            }

            // 3. Atualiza a imagem COLORIDA E HD
            const buffer = await generateSlotCanvas(gridKeys, currentBet, totalWin);
            const attachment = new AttachmentBuilder(buffer, { name: 'kibo_slot.png' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`tig_action_down_${currentBet}_${ownerId}`).setLabel('➖').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`tig_action_spin_${currentBet}_${ownerId}`).setLabel(`🎰 GIRAR NOVAMENTE`).setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`tig_action_up_${currentBet}_${ownerId}`).setLabel('➕').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId(`tig_action_exit_0_${ownerId}`).setLabel('🏃 Sair').setStyle(ButtonStyle.Danger)
            );

            let msgExtra = totalWin > 0 ? `🎉 **MÁQUINA PAGOU!** Você ganhou **$${totalWin.toLocaleString('pt-BR')}**!` : '💸 Nenhum ganho. Gire novamente!';

            return interaction.update({ 
                content: msgExtra,
                files: [attachment], 
                components: [row] 
            });
        }
    }
};