import { createCanvas, loadImage } from 'canvas';

// Mapeamento dos Emotes Padrão (Twemoji HD) e seus multiplicadores
export const SLOTS = {
    'tiger':   { emoji: '🐯', url: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f42f.png', mult: 100 },
    'diamond': { emoji: '💎', url: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f48e.png', mult: 50 },
    'bell':    { emoji: '🔔', url: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f514.png', mult: 25 },
    'grape':   { emoji: '🍇', url: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f347.png', mult: 10 },
    'lemon':   { emoji: '🍋', url: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f34b.png', mult: 5 },
    'cherry':  { emoji: '🍒', url: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f352.png', mult: 2 }
};

export async function generateSlotCanvas(gridKeys, bet, winAmount = 0) {
    // RESOLUÇÃO ULTRA-HD QUADRADA LARGA (1400x1100)
    const canvasWidth = 1400; 
    const canvasHeight = 1100;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Fundo da máquina
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Borda Neon
    ctx.strokeStyle = winAmount > 0 ? '#00FF66' : '#FFD700';
    ctx.lineWidth = 15;
    ctx.strokeRect(15, 15, canvasWidth - 30, canvasHeight - 30);

    // TÍTULO
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🐯 FORTUNE TIGER KIBO 🐯', canvasWidth / 2, 120);

    // PAINEL INFO
    ctx.fillStyle = '#11131a';
    ctx.fillRect(80, 160, 1240, 120);
    ctx.strokeStyle = '#22252c';
    ctx.lineWidth = 6;
    ctx.strokeRect(80, 160, 1240, 120);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 45px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`APOSTA ATUAL: $${bet.toLocaleString()}`, 120, 235);

    ctx.textAlign = 'right';
    if (winAmount > 0) {
        ctx.fillStyle = '#00FF66';
        ctx.fillText(`LUCRO: +$${winAmount.toLocaleString()}`, 1300, 235);
    } else {
        ctx.fillStyle = '#FF4444';
        ctx.fillText(`NENHUM GANHO`, 1300, 235);
    }

    // GRID 3x3 EMOTES COLORIDOS
    const boxSize = 350; 
    const gap = 30;
    const startX = (canvasWidth - (3 * boxSize) - (2 * gap)) / 2;
    const startY = 320; 

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const key = gridKeys[row][col];
            const symbolData = SLOTS[key];
            
            const x = startX + (col * (boxSize + gap));
            const y = startY + (row * (boxSize + gap));

            ctx.fillStyle = '#1f2229';
            ctx.fillRect(x, y, boxSize, boxSize);
            
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 5;
            ctx.strokeRect(x, y, boxSize, boxSize);

            // DESENHA O EMOTE COLORIDO
            try {
                const img = await loadImage(symbolData.url);
                const imgSize = boxSize * 0.7; 
                const imgX = x + (boxSize - imgSize) / 2;
                const imgY = y + (boxSize - imgSize) / 2;
                ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
            } catch (err) {
                console.error(`Erro ao carregar emote para o Canvas: ${symbolData.emoji}`, err);
                ctx.fillStyle = '#FFFFFF'; ctx.font = '70px Arial'; ctx.textAlign = 'center';
                ctx.fillText(symbolData.emoji, x + boxSize / 2, y + boxSize / 2 + 25);
            }
        }
    }

    return canvas.toBuffer();
}