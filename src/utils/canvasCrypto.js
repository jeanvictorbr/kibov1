import { createCanvas, loadImage } from 'canvas';

// Função utilitária: Retângulo arredondado
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

// Função utilitária: Desenhar Triângulo (Seta de Alta/Baixa)
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

    // Fundo Degradê Dark
    const gradient = ctx.createLinearGradient(0, 0, 800, 400);
    gradient.addColorStop(0, '#0B0D14');
    gradient.addColorStop(1, '#1A1E29');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Titulo com Neon
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#F3BA2F';
    ctx.fillStyle = '#F3BA2F';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('KIBO EXCHANGE', 40, 70);
    ctx.shadowBlur = 0; // Reseta o brilho

    // Subtítulo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '22px sans-serif';
    ctx.fillText('A maior bolsa de valores da Deep Web.', 40, 110);

    // Caixa de Informação Estilizada
    ctx.fillStyle = '#12151F';
    ctx.strokeStyle = '#2A2E3D';
    ctx.lineWidth = 2;
    roundRect(ctx, 40, 150, 560, 200, 15, true, true);

    ctx.fillStyle = '#00F2FE';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('SISTEMA DE OPERACOES:', 60, 190);

    ctx.fillStyle = '#CCCCCC';
    ctx.font = '19px sans-serif';
    ctx.fillText('> Atualizacao de mercado a cada 1 HORA.', 60, 235);
    ctx.fillText('> Risco e volatilidade de ate 45% em MemeCoins.', 60, 275);
    ctx.fillText('> Seus fundos em Cripto nao podem ser roubados.', 60, 315);

    // ==========================================
    // RENDERIZAR AVATAR DO USUÁRIO COM NEON
    // ==========================================
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

        // Borda Neon no Avatar
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, radius, 0, Math.PI * 2, true);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#00F2FE';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00F2FE';
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Nome do Usuário debaixo do Avatar
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(user.username.toUpperCase(), avatarX, avatarY + 90);
        ctx.textAlign = 'left';

    } catch (e) {
        console.log("Erro ao carregar avatar no Canvas.");
    }

    return canvas.toBuffer();
}

// ==========================================
// 2. TELA DE MERCADO GERAL
// ==========================================
export async function generateCryptoMarket(market) {
    const canvas = createCanvas(800, 400);
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

        // Box da moeda
        ctx.fillStyle = '#12151F';
        ctx.strokeStyle = '#2A2E3D';
        ctx.lineWidth = 1;
        roundRect(ctx, startX, startY, 340, 85, 10, true, true);

        // Nome da Moeda
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`${data.name} (${data.coin})`, startX + 20, startY + 35);

        // Preço e Porcentagem
        ctx.fillStyle = color;
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`$${data.price.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, startX + 45, startY + 68);
        
        ctx.font = '18px sans-serif';
        ctx.fillText(`(${sign}${change.toFixed(2)}%)`, startX + 220, startY + 68);

        // Desenhar Seta Visual
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
// 3. TELA DE ANÁLISE DE MOEDA (GRÁFICO)
// ==========================================
export async function generateCoinChart(coinData) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    const change = ((coinData.price - coinData.lastPrice) / coinData.lastPrice) * 100;
    const isUp = change >= 0;
    const themeColor = isUp ? '#00FF66' : '#FF3366';

    ctx.fillStyle = '#0B0D14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Titulo e Info
    ctx.shadowBlur = 15;
    ctx.shadowColor = themeColor;
    ctx.fillStyle = themeColor;
    ctx.font = 'bold 45px sans-serif';
    ctx.fillText(`${coinData.name} (${coinData.coin})`, 40, 60);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`Atual: $${coinData.price.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 40, 110);

    ctx.fillStyle = '#AAAAAA';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Anterior: $${coinData.lastPrice.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 40, 140);
    
    // Status Text
    const statusText = isUp ? 'TENDENCIA DE ALTA (BULL MARKET)' : 'MERCADO SANGRAMENTO (BEAR MARKET)';
    ctx.fillStyle = themeColor;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`STATUS: ${statusText}`, 40, 170);

    // ==========================================
    // DESENHAR O GRÁFICO DE LINHA NEON
    // ==========================================
    const graphX = 350;
    const graphY = 60;
    const graphW = 400;
    const graphH = 280;

    // Fundo do gráfico
    ctx.fillStyle = '#12151F';
    ctx.strokeStyle = '#2A2E3D';
    roundRect(ctx, graphX, graphY, graphW, graphH, 10, true, true);

    // Simular pontos do gráfico baseados no Last e Current Price
    const points = 6;
    const stepX = graphW / (points - 1);
    
    ctx.beginPath();
    ctx.moveTo(graphX, graphY + graphH / 2); // Ponto inicial simulado

    let currentX = graphX;
    for (let i = 0; i < points; i++) {
        // Gera uma oscilação visual para o gráfico
        let randomYOffset = (Math.random() - 0.5) * 80;
        let pointY = graphY + (graphH / 2) + randomYOffset;
        
        // Força o último ponto a respeitar a tendência real
        if (i === points - 1) {
            pointY = isUp ? graphY + 40 : graphY + graphH - 40; 
        }

        ctx.lineTo(currentX, pointY);
        currentX += stepX;
    }

    // Linha do gráfico
    ctx.lineWidth = 4;
    ctx.strokeStyle = themeColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = themeColor;
    ctx.stroke();
    ctx.shadowBlur = 0;

    return canvas.toBuffer();
}

// ==========================================
// 4. TELA DA CARTEIRA
// ==========================================
export async function generateCryptoWallet(user, wallet, market) {
    const canvas = createCanvas(800, 400);
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
        ctx.fillText('Seu cofre de investimentos está vazio.', 40, 150);
        ctx.fillText('Compre moedas para ver seu patrimônio aqui.', 40, 180);
    }

    // Linha do Patrimônio Total
    ctx.fillStyle = '#1A1E29';
    roundRect(ctx, 40, 330, 720, 50, 10, true, false);

    ctx.fillStyle = '#F3BA2F';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`VALOR TOTAL EM DOLAR: $${totalUsd.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 60, 365);

    return canvas.toBuffer();
}