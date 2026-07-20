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
    // 1. PASSO DE MEDIÇÃO: Cria um canvas fantasma só para calcular as quebras de linha
    const dummyCanvas = createCanvas(800, 600);
    const dCtx = dummyCanvas.getContext('2d');
    dCtx.font = '16px Arial'; // A mesma fonte e tamanho da descrição

    const maxTextWidth = 660; // Largura máxima que o texto pode atingir dentro da caixa
    let totalHeight = 130; // Começa com espaço pro cabeçalho

    // Calcula a altura dinâmica baseada no tamanho do texto
    const parsedItems = items.map(item => {
        const words = item.description.split(' ');
        let line = '';
        let lines = [];
        
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let testWidth = dCtx.measureText(testLine).width;
            if (testWidth > maxTextWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // Define a altura desta caixa específica (Topo + Linhas + Base)
        const blockHeight = 40 + (lines.length * 22) + 20;
        totalHeight += blockHeight + 25; // 25 de espaço para a próxima caixa

        return { ...item, lines, blockHeight };
    });

    totalHeight += 30; // Espaçamento extra no fundo da imagem

    // 2. PASSO DE DESENHO: Cria o Canvas real com a altura perfeita que calculamos
    const canvas = createCanvas(800, totalHeight);
    const ctx = canvas.getContext('2d');

    // Fundo Deep Web
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grade Tática (Radar)
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 800; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, totalHeight); ctx.stroke(); }
    for (let i = 0; i < totalHeight; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(800, i); ctx.stroke(); }
    ctx.globalAlpha = 1.0;

    // Título Principal
    ctx.shadowColor = '#00FF66';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🛒 MERCADO KIBO', 400, 65);

    // Linha Divisória
    ctx.fillStyle = '#00FF66';
    ctx.fillRect(200, 90, 400, 3);
    ctx.shadowBlur = 0; // Desliga o brilho pra não pesar no texto

    // 3. DESENHANDO OS ITENS E CAIXAS
    let currentY = 130;

    for (const item of parsedItems) {
        // Caixa de Fundo do Item
        ctx.fillStyle = 'rgba(0, 255, 102, 0.03)';
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.6)';
        ctx.lineWidth = 2;
        
        ctx.shadowColor = '#00FF66';
        ctx.shadowBlur = 8;
        drawRoundRect(ctx, 40, currentY, 720, item.blockHeight, 15);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Nome do Item
        ctx.fillStyle = '#FFD700'; // Dourado
        ctx.font = 'bold 28px Courier New';
        ctx.textAlign = 'left';
        const displayName = item.name.replace(/_/g, ' '); // Tira underline
        ctx.fillText(displayName, 70, currentY + 40);

        // Preço
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`$${item.price.toLocaleString('pt-BR')}`, 730, currentY + 40);

        // Descrição Dinâmica
        ctx.fillStyle = '#888899'; // Mantive o cinza do seu original
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        
        let lineY = currentY + 70;
        for (const line of item.lines) {
            ctx.fillText(line, 70, lineY);
            lineY += 22;
        }

        currentY += item.blockHeight + 25; // Avassnça para o Y da próxima caixa
    }

    return canvas.toBuffer();
}