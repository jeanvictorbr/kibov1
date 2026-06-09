import { createCanvas } from 'canvas';

// Configuração dos Símbolos, Cores e Multiplicadores
export const SLOTS = {
    'CEREJA': { color: '#FF0055', mult: 2 },
    'LIMÃO':  { color: '#FFD700', mult: 3 },
    'UVA':    { color: '#9933CC', mult: 5 },
    'SINO':   { color: '#FFaa00', mult: 10 },
    'DIMA':   { color: '#00FFFF', mult: 20 },
    'TIGRE':  { color: '#FF6600', mult: 50 }
};

export async function generateSlotCanvas(grid, bet, winAmount = 0, isSpinning = false) {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Fundo da máquina
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Borda Neon da Máquina
    ctx.strokeStyle = winAmount > 0 ? '#00FF66' : '#FF6600'; // Fica verde se ganhar
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Letreiro do Tigrinho
    ctx.fillStyle = '#FF6600';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🐯 FORTUNE TIGER 🐯', canvas.width / 2, 80);

    // Painel de Informações (Aposta e Ganho)
    ctx.fillStyle = '#11131a';
    ctx.fillRect(50, 110, 700, 70);
    ctx.strokeStyle = '#22252c';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 110, 700, 70);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`APOSTA: $${bet.toLocaleString()}`, 70, 155);

    ctx.textAlign = 'right';
    if (isSpinning) {
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`GIRANDO...`, 730, 155);
    } else if (winAmount > 0) {
        ctx.fillStyle = '#00FF66';
        ctx.fillText(`GANHO: +$${winAmount.toLocaleString()}`, 730, 155);
    } else {
        ctx.fillStyle = '#FF4444';
        ctx.fillText(`NENHUM GANHO`, 730, 155);
    }

    // DESENHAR O GRID 3x3
    const startX = 140;
    const startY = 210;
    const boxSize = 160;
    const gap = 20;

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const symbolKey = grid[row][col];
            const symbolData = SLOTS[symbolKey];
            
            const x = startX + (col * (boxSize + gap));
            const y = startY + (row * (boxSize + gap));

            // Fundo da Pedra
            ctx.fillStyle = '#1f2229';
            ctx.fillRect(x, y, boxSize, boxSize);
            
            // Borda da Pedra
            ctx.strokeStyle = symbolData ? symbolData.color : '#333';
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, boxSize, boxSize);

            // Texto da Pedra
            if (symbolData) {
                ctx.fillStyle = symbolData.color;
                ctx.font = 'bold 32px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(symbolKey, x + (boxSize / 2), y + (boxSize / 2) + 12);
            }
        }
    }

    return canvas.toBuffer();
}