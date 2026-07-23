import { createCanvas } from 'canvas';

// Função para arredondar cantos (padrão de UI bonita)
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

export async function generateCryptoHub(user) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    // Fundo Dark / Neon
    ctx.fillStyle = '#0F111A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Titulo
    ctx.fillStyle = '#F3BA2F';
    ctx.font = 'bold 45px sans-serif';
    ctx.fillText('💹 KIBO EXCHANGE', 40, 70);

    // Subtítulo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '22px sans-serif';
    ctx.fillText(`Bem-vindo à bolsa de valores da Deep Web, ${user.username}.`, 40, 110);

    // Caixa de Informação
    ctx.fillStyle = '#1A1D29';
    roundRect(ctx, 40, 150, 720, 180, 15, true, false);

    ctx.fillStyle = '#AAAAAA';
    ctx.font = '20px sans-serif';
    ctx.fillText('► O mercado global é atualizado a cada 1 HORA.', 60, 200);
    ctx.fillText('► Compre na baixa (🔻) e venda na alta (🚀).', 60, 240);
    ctx.fillText('► Criptomoedas não podem ser roubadas por outros jogadores.', 60, 280);

    return canvas.toBuffer();
}

export async function generateCryptoMarket(market) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0F111A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00FF66';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('📊 COTAÇÃO DO MERCADO', 40, 60);

    // Desenha as 6 moedas
    let startY = 120;
    let startX = 40;
    
    for (let i = 0; i < market.length; i++) {
        const data = market[i];
        const change = ((data.price - data.lastPrice) / data.lastPrice) * 100;
        const color = change >= 0 ? '#00FF66' : '#FF3333';
        const sign = change >= 0 ? '+' : '';

        // Box da moeda
        ctx.fillStyle = '#1A1D29';
        roundRect(ctx, startX, startY, 340, 80, 10, true, false);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`${data.name} (${data.coin})`, startX + 20, startY + 35);

        ctx.fillStyle = color;
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`$${data.price.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} (${sign}${change.toFixed(2)}%)`, startX + 20, startY + 65);

        startX += 380;
        if (i % 2 !== 0) {
            startX = 40;
            startY += 100;
        }
    }

    return canvas.toBuffer();
}

export async function generateCryptoWallet(user, wallet, market) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0F111A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('💼 CARTEIRA DE INVESTIMENTOS', 40, 60);

    let startY = 120;
    let totalUsd = 0;
    let hasCoins = false;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '22px sans-serif';

    for (const data of market) {
        const amount = wallet[data.coin] || 0;
        if (amount > 0) {
            hasCoins = true;
            const usdValue = amount * data.price;
            totalUsd += usdValue;
            
            ctx.fillStyle = '#1A1D29';
            roundRect(ctx, 40, startY - 25, 720, 40, 5, true, false);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`${data.coin}:`, 60, startY);
            ctx.fillStyle = '#AAAAAA';
            ctx.fillText(`${amount.toLocaleString('pt-BR')} moedas  →  ≈ $${usdValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 160, startY);
            startY += 50;
        }
    }

    if (!hasCoins) {
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText('Sua carteira de investimentos está completamente vazia.', 40, 150);
    }

    // Linha do Patrimônio Total
    ctx.fillStyle = '#F3BA2F';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`PATRIMÔNIO TOTAL: $${totalUsd.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`, 40, 360);

    return canvas.toBuffer();
}