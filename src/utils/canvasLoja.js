import { createCanvas } from 'canvas';

// Função auxiliar para desenhar caixas com bordas arredondadas no Canvas
function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

export async function generateLojaCanvas(items) {
    // 1. MEDIÇÃO DAS QUEBRAS DE LINHA
    const dummyCanvas = createCanvas(800, 600);
    const dCtx = dummyCanvas.getContext('2d');
    dCtx.font = '16px Arial';

    const maxTextWidth = 660; 
    let totalHeight = 130; 

    const parsedItems = items.map(item => {
        const words = item.description.split(' ');
        let line = '';
        let lines = [];
        
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let testWidth = dCtx.measureText(testLine).width;
            if (testWidth > maxTextWidth && n > 0) {
                lines.push(line.trim());
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        const blockHeight = 40 + (lines.length * 22) + 20;
        totalHeight += blockHeight + 25;

        return { ...item, lines, blockHeight };
    });

    totalHeight += 30;

    // 2. DESENHO DO CANVAS OFICIAL
    const canvas = createCanvas(800, totalHeight);
    const ctx = canvas.getContext('2d');

    // Fundo Tático Deep Web
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grade de Radar (bem suave pra não poluir)
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 800; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, totalHeight); ctx.stroke(); }
    for (let i = 0; i < totalHeight; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(800, i); ctx.stroke(); }
    ctx.globalAlpha = 1.0;

    // Título Principal (Esse sim tem um leve neon)
    ctx.shadowColor = '#00FF66';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🛒 MERCADO KIBO', 400, 65);

    // Linha Divisória
    ctx.fillStyle = '#00FF66';
    ctx.fillRect(200, 90, 400, 3);
    
    // 🔥 CORREÇÃO PRINCIPAL: Desligando a sombra radioativa!
    ctx.shadowBlur = 0; 
    ctx.shadowColor = 'transparent';

    // 3. DESENHANDO OS ITENS E CAIXAS
    let currentY = 130;

    for (const item of parsedItems) {
        // Caixa de Fundo Escura (Contraste perfeito)
        ctx.fillStyle = '#11131a'; 
        ctx.strokeStyle = '#00FF66'; // Borda verde fininha e elegante
        ctx.lineWidth = 1.5;
        
        drawRoundRect(ctx, 40, currentY, 720, item.blockHeight, 15);
        ctx.fill();
        ctx.stroke();

        // Nome do Item
        ctx.fillStyle = '#FFD700'; // Dourado forte
        ctx.font = 'bold 28px Courier New';
        ctx.textAlign = 'left';
        const displayName = item.name.replace(/_/g, ' '); 
        ctx.fillText(displayName, 70, currentY + 40);

        // Preço
        ctx.fillStyle = '#00FF66'; // Verde nítido
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`$${item.price.toLocaleString('pt-BR')}`, 730, currentY + 40);

        // Descrição (Agora num tom claro qssuase branco pra ficar super legível)
        ctx.fillStyle = '#E0E5FF'; 
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        
        let lineY = currentY + 70;
        for (const line of item.lines) {
            ctx.fillText(line, 70, lineY);
            lineY += 22;
        }

        currentY += item.blockHeight + 25;
    }

    return canvas.toBuffer();
}