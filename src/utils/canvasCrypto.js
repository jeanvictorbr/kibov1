import { createCanvas, loadImage } from 'canvas';

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
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
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

function drawArrow(ctx, x, y, size, isUp) {
    ctx.beginPath();
    if (isUp) {
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x - size, y + size);
    } else {
        ctx.moveTo(x - size, y - size);
        ctx.lineTo(x + size, y - size);
        ctx.lineTo(x, y + size);
    }
    ctx.fill();
}

// ==========================================
// 1. TELA PRINCIPAL (HUB)
// ==========================================
export async function generateCryptoHub(user) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 800, 400);
    gradient.addColorStop(0, '#0B0D14');
    gradient.addColorStop(1, '#1A1E29');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#F3BA2F';
    ctx.fillStyle = '#F3BA2F';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('KIBO EXCHANGE', 40, 70);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '22px sans-serif';
    ctx.fillText('A maior bolsa de valores da Deep Web.', 40, 110);

    ctx.fillStyle = '#12151F';
    ctx.strokeStyle = '#2A2E3D';
    ctx.lineWidth = 2;
    roundRect(ctx, 40, 150, 560, 200, 15, true, true);

    ctx.fillStyle = '#00F2FE';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('SISTEMA DE OPERACOES:', 60, 190);

    ctx.fillStyle = '#CCCCCC';
    ctx.font = '19px sans-serif';
    ctx.fillText('> Atualizacao de mercado a cada 10 MINUTOS.', 60, 235);
    ctx.fillText('> Risco e volatilidade de ate 45% em MemeCoins.', 60, 275);
    ctx.fillText('> Seus fundos em Cripto nao podem ser roubados.', 60, 315);

    try {
        const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 128 });
        const avatar = await loadImage(avatarUrl);
        const avatarX = 660;
        const avatarY = 180;
        const radius = 60;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX - radius, avatarY - radius, radius * 2, radius * 2);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(avatarX, avatarY, radius, 0, Math.PI * 2, true);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#00F2FE';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00F2FE';
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(user.username.toUpperCase(), avatarX, avatarY + 90);
        ctx.textAlign = 'left';
    } catch (e) {}

    return canvas.toBuffer();
}

// ==========================================
// 2. TELA DE MERCADO GERAL (AUMENTADA PARA 9 MOEDAS)
// ==========================================
export async function generateCryptoMarket(market) {
    // Canvas esticado para caber todas as linhas de moedas
    const canvas = createCanvas(800, 650);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0B0D14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00FF66';
    ctx.fillStyle = '#00FF66';
    ctx.font = 'bold 35px sans-serif';
    ctx.fillText('COTACAO GLOBAL (TEMPO REAL)', 40, 50);
    ctx.shadowBlur = 0;

    let startY = 90;
    let startX = 40;
    
    for (let i = 0; i < market.length; i++) {
        const data = market[i];
        const change = ((data.price - data.lastPrice) / data.lastPrice) * 100;
        const isUp = change >= 0;
        const color = isUp ? '#00FF66' : '#FF3366';
        const sign = isUp ? '+' : '';

        ctx.fillStyle = '#12151F';
        ctx.strokeStyle = '#2A2E3D';
        ctx.lineWidth = 1;
        roundRect(ctx, startX, startY, 340, 85, 10, true, true);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`${data.name} (${data.coin})`, startX + 20, startY + 35);

        ctx.fillStyle = color;
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`$${data.price.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, startX + 45, startY + 68);
        
        ctx.font = '18px sans-serif';
        ctx.fillText(`(${sign}${change.toFixed(2)}%)`, startX + 220, startY + 68);

        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        drawArrow(ctx, startX + 25, startY + 62, 8, isUp);
        ctx.shadowBlur = 0;

        startX += 380;
        if (i % 2 !== 0) {
            startX = 40;
            startY += 100;
        }
    }

    return canvas.toBuffer();
}

// ==========================================
// 3. TELA DE ANÁLISE DE MOEDA
// ==========================================
export async function generateCoinChart(coinData, userAmount = 0) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    const change = ((coinData.price - coinData.lastPrice) / coinData.lastPrice) * 100;
    const isUp = change >= 0;
    const themeColor = isUp ? '#00FF66' : '#FF3366';

    ctx.fillStyle = '#0B0D14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 15;
    ctx.shadowColor = themeColor;
    ctx.fillStyle = themeColor;
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(`${coinData.name} (${coinData.coin})`, 40, 60);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`Atual: $${coinData.price.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 40, 110);

    ctx.fillStyle = '#AAAAAA';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Anterior: $${coinData.lastPrice.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 40, 140);
    
    ctx.fillStyle = themeColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`TENDENCIA DE MERCADO:`, 40, 180);
    ctx.font = 'bold 20px sans-serif';
    const statusText = isUp ? 'ALTA (BULL MARKET)' : 'QUEDA (BEAR MARKET)';
    ctx.fillText(statusText, 40, 205);

    ctx.fillStyle = '#1A1E29';
    roundRect(ctx, 40, 250, 320, 80, 10, true, false);
    ctx.fillStyle = '#00F2FE';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('SEUS ATIVOS NESTA MOEDA:', 60, 280);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '22px sans-serif';
    ctx.fillText(`${userAmount.toLocaleString('pt-BR')} ${coinData.coin}`, 60, 310);

    const graphX = 390; 
    const graphY = 60;
    const graphW = 360; 
    const graphH = 280;

    ctx.fillStyle = '#12151F';
    ctx.strokeStyle = '#2A2E3D';
    roundRect(ctx, graphX, graphY, graphW, graphH, 10, true, true);

    const points = 6;
    const stepX = graphW / (points - 1);
    
    ctx.beginPath();
    ctx.moveTo(graphX, graphY + graphH / 2);

    let currentX = graphX;
    for (let i = 0; i < points; i++) {
        let randomYOffset = (Math.random() - 0.5) * 80;
        let pointY = graphY + (graphH / 2) + randomYOffset;
        if (i === points - 1) {
            pointY = isUp ? graphY + 40 : graphY + graphH - 40; 
        }
        ctx.lineTo(currentX, pointY);
        currentX += stepX;
    }

    ctx.lineWidth = 4;
    ctx.strokeStyle = themeColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = themeColor;
    ctx.stroke();
    ctx.shadowBlur = 0;

    return canvas.toBuffer();
}

// ==========================================
// 4. TELA DA CARTEIRA (ADAPTÁVEL E PROTEGIDA)
// ==========================================
export async function generateCryptoWallet(user, wallet, market) {
    // Canvas altíssimo para caber caso o cara seja bilionário e tenha as 9 moedas!
    const canvas = createCanvas(800, 750);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0B0D14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00F2FE';
    ctx.fillStyle = '#00F2FE';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('COFRE DE ATIVOS DIGITAIS', 40, 60);
    ctx.shadowBlur = 0;

    let startY = 110;
    let totalUsd = 0;
    let hasCoins = false;

    for (const data of market) {
        const amount = wallet[data.coin] || 0;
        if (amount > 0) {
            hasCoins = true;
            const usdValue = amount * data.price;
            totalUsd += usdValue;
            
            ctx.fillStyle = '#12151F';
            ctx.strokeStyle = '#2A2E3D';
            roundRect(ctx, 40, startY - 25, 720, 45, 8, true, true);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 22px sans-serif';
            ctx.fillText(`${data.coin}:`, 60, startY + 5);
            
            ctx.fillStyle = '#00FF66';
            ctx.font = '20px sans-serif';
            ctx.fillText(`${amount.toLocaleString('pt-BR')} unidades`, 150, startY + 5);

            ctx.fillStyle = '#AAAAAA';
            ctx.fillText(`Convertido: $${usdValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 400, startY + 5);

            startY += 55;
        }
    }

    if (!hasCoins) {
        ctx.fillStyle = '#FF3366';
        ctx.font = '22px sans-serif';
        ctx.fillText('Seu cofre de investimentos esta vazio.', 40, 150);
        ctx.fillText('Compre moedas para ver seu patrimonio aqui.', 40, 180);
    }

    // A MÁGICA: A barra de total desce dinamicamente baseada em quantas moedas o cara tem!
    const finalY = Math.max(startY + 30, 180);

    ctx.fillStyle = '#1A1E29';
    roundRect(ctx, 40, finalY, 720, 50, 10, true, false);

    ctx.fillStyle = '#F3BA2F';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`VALOR TOTAL EM DOLAR: $${totalUsd.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 60, finalY + 35);

    return canvas.toBuffer();
}

// ==========================================
// 5. O COMPROVANTE (PIX DA EXCHANGE)
// ==========================================
export async function generateCryptoReceipt(user, action, coin, amount, totalValue, coinPrice) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    const isBuy = action === 'COMPRA';
    const mainColor = isBuy ? '#00F2FE' : '#FF3366';

    ctx.fillStyle = '#0B0D14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = mainColor;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.shadowBlur = 0;

    ctx.fillStyle = mainColor;
    ctx.font = 'bold 35px sans-serif';
    ctx.fillText('COMPROVANTE DE EXECUCAO', 50, 70);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Operador: ${user.username.toUpperCase()}`, 50, 110);

    ctx.fillStyle = '#2A2E3D';
    ctx.fillRect(50, 130, 700, 2);

    ctx.fillStyle = '#AAAAAA';
    ctx.font = '22px sans-serif';
    ctx.fillText('TIPO DE ORDEM:', 50, 180);
    ctx.fillText('ATIVO:', 50, 230);
    ctx.fillText('QUANTIDADE:', 50, 280);
    ctx.fillText('COTACAO DA HORA:', 50, 330);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(isBuy ? 'COMPRA (DEBITO)' : 'VENDA (CREDITO PIX)', 280, 180);
    ctx.fillText(coin, 280, 230);
    ctx.fillText(`${amount.toLocaleString('pt-BR')} unidades`, 280, 280);
    ctx.fillText(`$${coinPrice.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 280, 330);

    ctx.fillStyle = '#12151F';
    ctx.strokeStyle = '#2A2E3D';
    roundRect(ctx, 500, 170, 250, 150, 10, true, true);

    ctx.fillStyle = mainColor;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(isBuy ? 'CUSTO TOTAL:' : 'LUCRO RECEBIDO:', 520, 210);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`$${totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 520, 260);

    ctx.fillStyle = '#AAAAAA';
    ctx.font = '14px sans-serif';
    ctx.fillText('Transacao na KiboBlockchain.', 520, 300);

    return canvas.toBuffer();
}