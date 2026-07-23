import { createCanvas, loadImage } from 'canvas';

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y); ctx.lineTo(x + width - radius, y); ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius); ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius); ctx.quadraticCurveTo(x, y, x + radius, y); ctx.closePath();
    if (fill) ctx.fill(); if (stroke) ctx.stroke();
}
function drawArrow(ctx, x, y, size, isUp) {
    ctx.beginPath();
    if (isUp) { ctx.moveTo(x, y - size); ctx.lineTo(x + size, y + size); ctx.lineTo(x - size, y + size); } 
    else { ctx.moveTo(x - size, y - size); ctx.lineTo(x + size, y - size); ctx.lineTo(x, y + size); }
    ctx.fill();
}

// 1. HUB DA EXCHANGE
export async function generateCryptoHub(user) {
    const canvas = createCanvas(800, 400); const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 800, 400);
    gradient.addColorStop(0, '#0B0D14'); gradient.addColorStop(1, '#1A1E29');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 20; ctx.shadowColor = '#F3BA2F'; ctx.fillStyle = '#F3BA2F';
    ctx.font = 'bold 48px sans-serif'; ctx.fillText('KIBO EXCHANGE', 40, 70); ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF'; ctx.font = '22px sans-serif'; ctx.fillText('A maior bolsa de valores da Deep Web.', 40, 110);

    ctx.fillStyle = '#12151F'; ctx.strokeStyle = '#2A2E3D'; ctx.lineWidth = 2;
    roundRect(ctx, 40, 150, 560, 200, 15, true, true);
    ctx.fillStyle = '#00F2FE'; ctx.font = 'bold 20px sans-serif'; ctx.fillText('SISTEMA DE OPERACOES:', 60, 190);
    ctx.fillStyle = '#CCCCCC'; ctx.font = '19px sans-serif';
    ctx.fillText('> Mercado atualizado a cada 10 MINUTOS.', 60, 235);
    ctx.fillText('> Taxa de Corretora (Gas Fee): 2% por operacao.', 60, 275);
    ctx.fillText('> Fique de olho no KiboNews para prever o mercado.', 60, 315);

    try {
        const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 128 });
        const avatar = await loadImage(avatarUrl);
        const avatarX = 660; const avatarY = 180; const radius = 60;
        ctx.save(); ctx.beginPath(); ctx.arc(avatarX, avatarY, radius, 0, Math.PI * 2, true);
        ctx.closePath(); ctx.clip(); ctx.drawImage(avatar, avatarX - radius, avatarY - radius, radius * 2, radius * 2); ctx.restore();
        ctx.beginPath(); ctx.arc(avatarX, avatarY, radius, 0, Math.PI * 2, true);
        ctx.lineWidth = 5; ctx.strokeStyle = '#00F2FE'; ctx.shadowBlur = 15; ctx.shadowColor = '#00F2FE'; ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(user.username.toUpperCase(), avatarX, avatarY + 90); ctx.textAlign = 'left';
    } catch (e) {} return canvas.toBuffer();
}

// 2. MERCADO GERAL (Mantido com 9 Moedas)
export async function generateCryptoMarket(market) {
    const canvas = createCanvas(800, 650); const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0B0D14'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 15; ctx.shadowColor = '#00FF66'; ctx.fillStyle = '#00FF66';
    ctx.font = 'bold 35px sans-serif'; ctx.fillText('COTACAO GLOBAL (TEMPO REAL)', 40, 50); ctx.shadowBlur = 0;
    
    let startY = 90; let startX = 40;
    for (let i = 0; i < market.length; i++) {
        const data = market[i]; const change = ((data.price - data.lastPrice) / data.lastPrice) * 100;
        const isUp = change >= 0; const color = isUp ? '#00FF66' : '#FF3366'; const sign = isUp ? '+' : '';
        ctx.fillStyle = '#12151F'; ctx.strokeStyle = '#2A2E3D'; ctx.lineWidth = 1; roundRect(ctx, startX, startY, 340, 85, 10, true, true);
        ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 22px sans-serif'; ctx.fillText(`${data.name} (${data.coin})`, startX + 20, startY + 35);
        ctx.fillStyle = color; ctx.font = 'bold 22px sans-serif'; ctx.fillText(`$${data.price.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, startX + 45, startY + 68);
        ctx.font = '18px sans-serif'; ctx.fillText(`(${sign}${change.toFixed(2)}%)`, startX + 220, startY + 68);
        ctx.fillStyle = color; ctx.shadowBlur = 10; ctx.shadowColor = color; drawArrow(ctx, startX + 25, startY + 62, 8, isUp); ctx.shadowBlur = 0;
        startX += 380; if (i % 2 !== 0) { startX = 40; startY += 100; }
    } return canvas.toBuffer();
}

// 3. ANÁLISE DE MOEDA (COM PREÇO MÉDIO E P&L)
export async function generateCoinChart(coinData, userAmount = 0, userInvested = 0) {
    const canvas = createCanvas(800, 450); const ctx = canvas.getContext('2d');
    const change = ((coinData.price - coinData.lastPrice) / coinData.lastPrice) * 100;
    const isUp = change >= 0; const themeColor = isUp ? '#00FF66' : '#FF3366';

    ctx.fillStyle = '#0B0D14'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 15; ctx.shadowColor = themeColor; ctx.fillStyle = themeColor;
    ctx.font = 'bold 40px sans-serif'; ctx.fillText(`${coinData.name} (${coinData.coin})`, 40, 60); ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`Atual: $${coinData.price.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 40, 110);
    ctx.fillStyle = '#AAAAAA'; ctx.font = '18px sans-serif';
    ctx.fillText(`Anterior: $${coinData.lastPrice.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 40, 140);
    
    // CAIXA DE ATIVOS & PREÇO MÉDIO
    ctx.fillStyle = '#1A1E29'; roundRect(ctx, 40, 180, 320, 230, 10, true, false);
    ctx.fillStyle = '#00F2FE'; ctx.font = 'bold 18px sans-serif'; ctx.fillText('SEUS ATIVOS (WALLET):', 60, 210);
    ctx.fillStyle = '#FFFFFF'; ctx.font = '22px sans-serif'; ctx.fillText(`${userAmount.toLocaleString('pt-BR')} ${coinData.coin}`, 60, 240);

    if (userAmount > 0) {
        const avgPrice = userInvested / userAmount;
        const profitPct = ((coinData.price - avgPrice) / avgPrice) * 100;
        const isProfit = profitPct >= 0;
        const pnlColor = isProfit ? '#00FF66' : '#FF3366';
        const pnlSign = isProfit ? '+' : '';

        ctx.fillStyle = '#AAAAAA'; ctx.font = '16px sans-serif'; ctx.fillText(`Preco Medio Pago:`, 60, 290);
        ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 20px sans-serif'; ctx.fillText(`$${avgPrice.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 60, 315);
        ctx.fillStyle = '#AAAAAA'; ctx.font = '16px sans-serif'; ctx.fillText(`Retorno do Investimento:`, 60, 355);
        ctx.fillStyle = pnlColor; ctx.font = 'bold 22px sans-serif'; ctx.fillText(`${pnlSign}${profitPct.toFixed(2)}%`, 60, 385);
    } else {
        ctx.fillStyle = '#AAAAAA'; ctx.font = '16px sans-serif'; ctx.fillText(`Voce nao possui fundos`, 60, 300); ctx.fillText(`neste ativo.`, 60, 325);
    }

    // GRÁFICO
    const graphX = 390; const graphY = 60; const graphW = 360; const graphH = 350;
    ctx.fillStyle = '#12151F'; ctx.strokeStyle = '#2A2E3D'; roundRect(ctx, graphX, graphY, graphW, graphH, 10, true, true);
    const points = 6; const stepX = graphW / (points - 1);
    ctx.beginPath(); ctx.moveTo(graphX, graphY + graphH / 2);
    let currentX = graphX;
    for (let i = 0; i < points; i++) {
        let randomYOffset = (Math.random() - 0.5) * 80; let pointY = graphY + (graphH / 2) + randomYOffset;
        if (i === points - 1) { pointY = isUp ? graphY + 40 : graphY + graphH - 40; }
        ctx.lineTo(currentX, pointY); currentX += stepX;
    }
    ctx.lineWidth = 4; ctx.strokeStyle = themeColor; ctx.shadowBlur = 15; ctx.shadowColor = themeColor; ctx.stroke(); ctx.shadowBlur = 0;

    return canvas.toBuffer();
}

// 4. CARTEIRA E RECIBO (Mantidos, mas com taxas no Recibo)
export async function generateCryptoWallet(user, wallet, market) {
    const canvas = createCanvas(800, 750); const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0B0D14'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 15; ctx.shadowColor = '#00F2FE'; ctx.fillStyle = '#00F2FE';
    ctx.font = 'bold 40px sans-serif'; ctx.fillText('COFRE DE ATIVOS DIGITAIS', 40, 60); ctx.shadowBlur = 0;
    let startY = 110; let totalUsd = 0; let hasCoins = false;
    for (const data of market) {
        const amount = wallet[data.coin] || 0;
        if (amount > 0) {
            hasCoins = true; const usdValue = amount * data.price; totalUsd += usdValue;
            ctx.fillStyle = '#12151F'; ctx.strokeStyle = '#2A2E3D'; roundRect(ctx, 40, startY - 25, 720, 45, 8, true, true);
            ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 22px sans-serif'; ctx.fillText(`${data.coin}:`, 60, startY + 5);
            ctx.fillStyle = '#00FF66'; ctx.font = '20px sans-serif'; ctx.fillText(`${amount.toLocaleString('pt-BR')} unidades`, 150, startY + 5);
            ctx.fillStyle = '#AAAAAA'; ctx.fillText(`Convertido: $${usdValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 400, startY + 5);
            startY += 55;
        }
    }
    if (!hasCoins) { ctx.fillStyle = '#FF3366'; ctx.font = '22px sans-serif'; ctx.fillText('Seu cofre esta vazio.', 40, 150); }
    const finalY = Math.max(startY + 30, 180);
    ctx.fillStyle = '#1A1E29'; roundRect(ctx, 40, finalY, 720, 50, 10, true, false);
    ctx.fillStyle = '#F3BA2F'; ctx.font = 'bold 26px sans-serif'; ctx.fillText(`VALOR TOTAL EM DOLAR: $${totalUsd.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 60, finalY + 35);
    return canvas.toBuffer();
}

export async function generateCryptoReceipt(user, action, coin, amount, grossValue, fee, totalValue, coinPrice) {
    const canvas = createCanvas(800, 450); const ctx = canvas.getContext('2d');
    const isBuy = action === 'COMPRA'; const mainColor = isBuy ? '#00F2FE' : '#FF3366';
    ctx.fillStyle = '#0B0D14'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = mainColor; ctx.lineWidth = 4; ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.fillStyle = mainColor; ctx.font = 'bold 35px sans-serif'; ctx.fillText('COMPROVANTE DE EXECUCAO', 50, 70);
    ctx.fillStyle = '#FFFFFF'; ctx.font = '20px sans-serif'; ctx.fillText(`Operador: ${user.username.toUpperCase()}`, 50, 110);
    ctx.fillStyle = '#2A2E3D'; ctx.fillRect(50, 130, 700, 2);
    ctx.fillStyle = '#AAAAAA'; ctx.font = '22px sans-serif';
    ctx.fillText('TIPO DE ORDEM:', 50, 180); ctx.fillText('ATIVO:', 50, 220); ctx.fillText('QUANTIDADE:', 50, 260); ctx.fillText('COTACAO DO ATIVO:', 50, 300); ctx.fillText('TAXA DA REDE (2%):', 50, 340);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 24px sans-serif';
    ctx.fillText(isBuy ? 'COMPRA (DEBITO)' : 'VENDA (CREDITO PIX)', 280, 180); ctx.fillText(coin, 280, 220); ctx.fillText(`${amount.toLocaleString('pt-BR')} unidades`, 280, 260);
    ctx.fillText(`$${coinPrice.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 280, 300);
    ctx.fillStyle = '#FF3366'; ctx.fillText(`$${fee.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 280, 340);
    
    ctx.fillStyle = '#12151F'; ctx.strokeStyle = '#2A2E3D'; roundRect(ctx, 500, 190, 250, 130, 10, true, true);
    ctx.fillStyle = mainColor; ctx.font = 'bold 18px sans-serif'; ctx.fillText(isBuy ? 'TOTAL PAGO:' : 'TOTAL RECEBIDO:', 520, 225);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 28px sans-serif'; ctx.fillText(`$${totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 520, 270);
    ctx.fillStyle = '#AAAAAA'; ctx.font = '14px sans-serif'; ctx.fillText('Transacao na KiboBlockchain.', 520, 305);
    return canvas.toBuffer();
}

// 5. O SISTEMA DE NOTÍCIAS DINÂMICO (JORNAL CYBERPUNK)
export async function generateCryptoNews(market) {
    const canvas = createCanvas(800, 400); const ctx = canvas.getContext('2d');
    
    // Calcula quem mais subiu e quem mais desceu
    const changes = market.map(m => { return { ...m, pct: ((m.price - m.lastPrice) / m.lastPrice) * 100 } }).sort((a, b) => b.pct - a.pct);
    const topGainer = changes[0]; const topLoser = changes[changes.length - 1];
    const timestamp = new Date(market[0].updatedAt);
    
    // O Seed garante que a notícia será a mesma durante aqueles 10 minutos
    const seed = timestamp.getMinutes() + timestamp.getHours() + timestamp.getDate();
    
    const gainerHeadlines = [
        `Escassez na rede faz {coin} disparar sem freio!`,
        `Baleias asiaticas compram milhoes em {coin}!`,
        `Governo legaliza {coin} e mercado entra em euforia!`,
        `Novo protocolo na blockchain leva {coin} pra lua!`,
        `Influenciadores causam PUMP massivo na {coin}!`
    ];
    const loserHeadlines = [
        `Escandalo de corrupcao faz {coin} derreter!`,
        `Ataque Hacker rouba fundos e afunda a {coin}.`,
        `Governo proibe {coin} e gera panico global!`,
        `Baleia despeja tudo e {coin} sofre crash violento.`,
        `Fundadores fogem com dinheiro da {coin} (RUG PULL)!`
    ];

    const gHeadline = gainerHeadlines[seed % gainerHeadlines.length].replace('{coin}', topGainer.name);
    const lHeadline = loserHeadlines[seed % loserHeadlines.length].replace('{coin}', topLoser.name);

    ctx.fillStyle = '#0B0D14'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#1A1E29'; ctx.fillRect(0, 0, 800, 60);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 30px sans-serif'; ctx.fillText('📰 KIBO NEWS | BOLETIM DE MERCADO', 20, 40);
    
    const timeStr = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
    ctx.fillStyle = '#00F2FE'; ctx.font = '20px sans-serif'; ctx.fillText(`Atualizado as ${timeStr}`, 580, 40);

    // Bloco Alta
    ctx.fillStyle = '#00FF66'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('🚀 DESTAQUE DE ALTA', 40, 110);
    ctx.fillStyle = '#12151F'; ctx.strokeStyle = '#00FF66'; ctx.lineWidth = 2; roundRect(ctx, 40, 130, 720, 80, 10, true, true);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 22px sans-serif'; ctx.fillText(gHeadline, 60, 175);
    ctx.fillStyle = '#00FF66'; ctx.font = 'bold 28px sans-serif'; ctx.fillText(`+${topGainer.pct.toFixed(2)}%`, 630, 178);

    // Bloco Baixa
    ctx.fillStyle = '#FF3366'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('🔻 DESTAQUE DE QUEDA', 40, 260);
    ctx.fillStyle = '#12151F'; ctx.strokeStyle = '#FF3366'; ctx.lineWidth = 2; roundRect(ctx, 40, 280, 720, 80, 10, true, true);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 22px sans-serif'; ctx.fillText(lHeadline, 60, 325);
    ctx.fillStyle = '#FF3366'; ctx.font = 'bold 28px sans-serif'; ctx.fillText(`${topLoser.pct.toFixed(2)}%`, 630, 328);

    return canvas.toBuffer();
}

// 6. HALL DA FAMA (RANKING)
export async function generateCryptoTop(usersList) {
    const canvas = createCanvas(800, 600); const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0B0D14'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.shadowBlur = 20; ctx.shadowColor = '#F3BA2F'; ctx.fillStyle = '#F3BA2F';
    ctx.font = 'bold 45px sans-serif'; ctx.fillText('🏆 HALL DA FAMA - BALEIAS', 40, 70); ctx.shadowBlur = 0;
    
    let startY = 120;
    for (let i = 0; i < usersList.length; i++) {
        const u = usersList[i];
        ctx.fillStyle = '#12151F'; ctx.strokeStyle = i === 0 ? '#F3BA2F' : '#2A2E3D';
        ctx.lineWidth = i === 0 ? 3 : 1;
        roundRect(ctx, 40, startY, 720, 80, 10, true, true);

        ctx.fillStyle = i === 0 ? '#F3BA2F' : '#FFFFFF';
        ctx.font = 'bold 35px sans-serif'; ctx.fillText(`#${i + 1}`, 60, startY + 52);
        
        try {
            const avatar = await loadImage(u.avatar);
            ctx.save(); ctx.beginPath(); ctx.arc(160, startY + 40, 30, 0, Math.PI * 2, true);
            ctx.closePath(); ctx.clip(); ctx.drawImage(avatar, 130, startY + 10, 60, 60); ctx.restore();
        } catch (e) {}

        ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 24px sans-serif'; ctx.fillText(u.username.toUpperCase(), 210, startY + 50);
        ctx.fillStyle = '#00F2FE'; ctx.font = 'bold 26px sans-serif'; ctx.fillText(`$${u.total.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 480, startY + 50);
        
        startY += 95;
    }
    return canvas.toBuffer();
}