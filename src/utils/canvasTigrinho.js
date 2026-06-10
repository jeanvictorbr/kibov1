import { createCanvas, loadImage } from 'canvas';

// Mapeamento dos Emotes Padrão (Twemoji HD) e seus multiplicadores
// Carregamos as imagens via URL para garantir que apareçam coloridas no Linux
export const SLOTS = {
    'tiger':   { emoji: '🐯', url: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f42f.png', mult: 100 },
    'diamond': { emoji: '💎', url: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f48e.png', mult: 50 },
    'bell':    { emoji: '🔔', url: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f514.png', mult: 25 },
    'grape':   { emoji: '🍇', url: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f347.png', mult: 10 },
    'lemon':   { emoji: '🍋', url: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f34b.png', mult: 5 },
    'cherry':  { emoji: '🍒', url: 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f352.png', mult: 2 }
};

export async function generateSlotCanvas(gridKeys, bet, winAmount = 0) {
    // RESOLUÇÃO 1:1 RESOLVIDA (1000x1000) - Tamanho ideal para o Discord renderizar completo
    const canvasWidth = 1000; 
    const canvasHeight = 1000;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Fundo da máquina
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Borda Neon
    ctx.strokeStyle = winAmount > 0 ? '#00FF66' : '#FFD700';
    ctx.lineWidth = 12;
    ctx.strokeRect(15, 15, canvasWidth - 30, canvasHeight - 30);

    // TÍTULO DA MÁQUINA
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 55px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🐯 FORTUNE TIGER KIBO 🐯', canvasWidth / 2, 90);

    // PAINEL DE INFORMAÇÕES
    ctx.fillStyle = '#11131a';
    ctx.fillRect(60, 140, 880, 100);
    ctx.strokeStyle = '#22252c';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 140, 880, 100);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`APOSTA: $${bet.toLocaleString('pt-BR')}`, 90, 200);

    ctx.textAlign = 'right';
    if (winAmount > 0) {
        ctx.fillStyle = '#00FF66';
        ctx.fillText(`LUCRO: +$${winAmount.toLocaleString('pt-BR')}`, 910, 200);
    } else {
        ctx.fillStyle = '#FF4444';
        ctx.fillText(`NENHUM GANHO`, 910, 200);
    }

    // DIMINUINDO AS CAIXAS PARA CABEREM TODAS NA TELA
    const boxSize = 200; // Reduzido de 350 para 200
    const gap = 25;
    
    const totalGridSize = (3 * boxSize) + (2 * gap); // Espaço total ocupado pelo jogo (650px)
    const startX = (canvasWidth - totalGridSize) / 2; // Centraliza horizontalmente
    const startY = 285; // Posição vertical logo abaixo do painel de infos

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const key = gridKeys[row][col];
            const symbolData = SLOTS[key];
            
            const x = startX + (col * (boxSize + gap));
            const y = startY + (row * (boxSize + gap));

            // Caixa interna do slot
            ctx.fillStyle = '#1f2229';
            ctx.fillRect(x, y, boxSize, boxSize);
            
            // Borda interna dourada/verde
            ctx.strokeStyle = winAmount > 0 ? '#00FF66' : '#FFD700';
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, boxSize, boxSize);

            // DESENHA O EMOTE TWEMOJI REDUZIDO
            try {
                // loadImage faz o download da imagem do CDN (Twitter) e desenha colorida
                const img = await loadImage(symbolData.url);
                const imgSize = boxSize * 0.75; // Emote ocupa 75% da caixinha
                const imgX = x + (boxSize - imgSize) / 2;
                const imgY = y + (boxSize - imgSize) / 2;
                ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
            } catch (err) {
                console.error(`Erro ao carregar emote para o Canvas: ${symbolData.emoji}`, err);
                ctx.fillStyle = '#FFFFFF'; ctx.font = '50px Arial'; ctx.textAlign = 'center';
                ctx.fillText(symbolData.emoji, x + boxSize / 2, y + boxSize / 2 + 15);
            }
        }
    }

    return canvas.toBuffer();
}