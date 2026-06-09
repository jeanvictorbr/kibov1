import { createCanvas } from 'canvas';
import { businesses } from './businessConfig.js';

// Função mágica para quebrar o texto (descrição) em várias linhas sem cortar
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
}

export async function generateMarketCanvas(ownedIds = []) {
    // RESOLUÇÃO ULTRA-HD (Larga e Quadrada)
    const canvasWidth = 1400; 
    const keys = Object.keys(businesses);
    const businessesPerRow = 2;
    const totalRows = Math.ceil(keys.length / businessesPerRow);

    // Dimensões exatas das caixas
    const paddingX = 60;
    const paddingY = 350; 
    const gap = 40;
    const boxWidth = 620;  // Caixas bem largas
    const boxHeight = 350; // Espaço de sobra pra descrição e lucro

    const canvasHeight = paddingY + (totalRows * (boxHeight + gap)); 
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Fundo Premium Black
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // TÍTULOS GIGANTES
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 65px Arial'; 
    ctx.fillText('🏢 MERCADO IMOBILIÁRIO OFICIAL', 60, 100);
    
    ctx.fillStyle = '#888899';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Adquira empresas exclusivas do sistema. Apenas UM DONO por negócio!', 60, 160);

    // AVISO VERMELHO GIGANTE
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 35px Arial';
    ctx.fillText('⚠️ REGRA DE OURO: NÃO DEIXE PASSAR 48H SEM COLETAR!', 60, 240);
    ctx.fillText('A empresa FALIRÁ automaticamente e você PERDERÁ TUDO!', 60, 290);

    // Linha divisória
    ctx.strokeStyle = '#22252c';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(60, 320); ctx.lineTo(canvasWidth - 60, 320); ctx.stroke();

    keys.forEach((key, index) => {
        const b = businesses[key];
        const isOwned = ownedIds.includes(key);
        
        const col = index % businessesPerRow; 
        const row = Math.floor(index / businessesPerRow); 
        const x = paddingX + (col * (boxWidth + gap)); 
        const y = paddingY + (row * (boxHeight + gap));

        // CAIXA QUADRADA
        ctx.fillStyle = '#11131a';
        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.strokeStyle = isOwned ? '#FF4444' : '#FFD700';
        ctx.lineWidth = 6; // Borda mais grossa
        ctx.strokeRect(x, y, boxWidth, boxHeight);

        // NOME DA EMPRESA
        ctx.fillStyle = isOwned ? '#888899' : '#FFD700';
        ctx.font = 'bold 42px Arial';
        ctx.fillText(b.name.toUpperCase(), x + 30, y + 60);

        // DESCRIÇÃO (Usando a função de quebrar linha)
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '26px Arial';
        wrapText(ctx, b.desc, x + 30, y + 110, boxWidth - 60, 35);

        // STATUS OU VALOR
        if (isOwned) {
            ctx.fillStyle = '#FF4444';
            ctx.font = 'bold 35px Courier New';
            ctx.fillText(`[ INDISPONÍVEL - JÁ COMPRADA ]`, x + 30, y + 210);
        } else {
            ctx.fillStyle = '#FFFFFF'; 
            ctx.font = 'bold 35px Courier New';
            ctx.fillText(`VALOR: $${b.price.toLocaleString()}`, x + 30, y + 210);
        }

        // RECEITA E CUSTO GIGANTES
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 30px Arial';
        ctx.fillText(`RECEITA DIÁRIA: +$${b.revenue.toLocaleString()}`, x + 30, y + 275);

        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 30px Arial';
        ctx.fillText(`CUSTO DIÁRIO:   -$${b.maintenance.toLocaleString()}`, x + 30, y + 320);
    });

    return canvas.toBuffer();
}

export async function generatePortfolioCanvas(user, userBiz) {
    const canvasWidth = 1400;
    const canvasHeight = 350 + (Math.max(userBiz.length, 1) * 180);
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 65px Arial';
    ctx.fillText('IMPÉRIO DE ' + user.username.toUpperCase(), 60, 100);
    
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 35px Arial';
    ctx.fillText('⚠️ ATENÇÃO: NÃO DEIXE PASSAR 48H SEM COLETAR!', 60, 180);
    ctx.fillText('Se a empresa falir, você perde tudo e ela volta pro mercado!', 60, 230);

    ctx.strokeStyle = '#22252c';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(60, 270); ctx.lineTo(canvasWidth - 60, 270); ctx.stroke();

    if (userBiz.length === 0) {
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 40px Arial';
        ctx.fillText('Você não possui nenhuma empresa ativa. Compre no Mercado.', 60, 350);
        return canvas.toBuffer();
    }

    userBiz.forEach((ub, index) => {
        const b = businesses[ub.businessId];
        const y = 300 + (index * 180);
        const horas = (Date.now() - new Date(ub.lastCollected)) / 3600000;

        ctx.fillStyle = '#1f2229';
        ctx.fillRect(60, y, 1280, 150);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 45px Arial';
        ctx.fillText(b.name, 90, y + 60);

        ctx.font = 'bold 32px Courier New';
        if (horas > 48) {
            ctx.fillStyle = '#FF4444';
            ctx.fillText('⚠️ FALIU POR FALTA DE MANUTENÇÃO (Será confiscada na coleta)', 90, y + 115);
        } else if (horas >= 24) {
            ctx.fillStyle = '#00FF66';
            ctx.fillText('✅ LUCRO DISPONÍVEL PARA COLETAR', 90, y + 115);
        } else {
            ctx.fillStyle = '#888899';
            ctx.fillText(`⏳ Aguarde ${Math.ceil(24 - horas)}h para coletar`, 90, y + 115);
        }
        
        if (ub.forSalePrice) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 30px Arial';
            ctx.fillText(`[ À VENDA NO MERCADO NEGRO POR $${ub.forSalePrice.toLocaleString()} ]`, 650, y + 60);
        }
    });

    return canvas.toBuffer();
}