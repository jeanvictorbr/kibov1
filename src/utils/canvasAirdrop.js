import { createCanvas, loadImage } from 'canvas';

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

export async function generateAirdropCanvas(host, amount, status = 'OPEN', participants = 0, splitAmount = 0) {
    const width = 850;
    const height = 450;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const isCanceled = status === 'CANCELED';
    const isClosed = status === 'CLOSED';
    const mainColor = isCanceled ? '#FF3333' : '#FFD700';

    // 1. Fundo Premium Profundo
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#050505');
    bgGradient.addColorStop(1, '#0f111a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Luz de Néon de Fundo (Glow 3D)
    const glow = ctx.createRadialGradient(width/2, height/2 + 50, 0, width/2, height/2 + 50, 400);
    glow.addColorStop(0, isCanceled ? 'rgba(255, 51, 51, 0.25)' : 'rgba(255, 215, 0, 0.25)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // 3. Painel de Vidro (Glassmorphism 3D)
    const panelW = 750;
    const panelH = 260;
    const panelX = (width - panelW) / 2;
    const panelY = 140;

    // Sombra pesada para fazer o painel flutuar
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    ctx.fillStyle = '#161824';
    drawRoundRect(ctx, panelX, panelY, panelW, panelH, 20);
    ctx.fill();
    ctx.restore();

    // Borda iluminada do painel
    ctx.strokeStyle = isCanceled ? 'rgba(255, 51, 51, 0.6)' : 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 4. Avatar do Magnata
    const avatarSize = 130;
    const avatarX = width / 2 - avatarSize / 2;
    const avatarY = 50;

    try {
        const avatarUrl = host.displayAvatarURL({ extension: 'png', size: 256 });
        const avatar = await loadImage(avatarUrl);
        
        ctx.save();
        ctx.shadowColor = mainColor;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.fill(); // Fundo preto para a sombra agarrar
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 6;
        ctx.stroke();
    } catch (e) {}

    // 5. Textos e Gradientes Metálicos
    ctx.textAlign = 'center';
    
    let title = '🌧️ CHUVA DE PIX 🌧️';
    if (isClosed) title = '🌧️ AIRDROP FINALIZADO 🌧️';
    if (isCanceled) title = '❌ AIRDROP CANCELADO ❌';
    
    ctx.fillStyle = mainColor;
    ctx.font = 'bold 36px Arial';
    ctx.fillText(title, width / 2, 215);

    // Efeito Ouro/Prata Metálico no Valor
    const valGradient = ctx.createLinearGradient(0, 230, 0, 310);
    valGradient.addColorStop(0, '#FFFFFF');
    valGradient.addColorStop(1, isCanceled ? '#ff9999' : '#B0B0C0');
    ctx.fillStyle = valGradient;
    ctx.font = 'bold 75px Arial';
    ctx.fillText(`$${amount.toLocaleString('pt-BR')}`, width / 2, 295);

    // 6. Rodapé Dinâmico
    ctx.fillStyle = '#A0A0B0';
    ctx.font = 'bold 22px Arial';
    if (status === 'OPEN') {
        ctx.fillText(`Patrocinado pelo Magnata: ${host.username}`, width / 2, 340);
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 26px Arial';
        ctx.fillText('⏳ Faltam 60 segundos! CLIQUE NO BOTÃO!', width / 2, 375);
    } else if (isClosed) {
        ctx.fillText(`${participants} jogadores participaram do rateio!`, width / 2, 340);
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 26px Arial';
        ctx.fillText(`💰 Ganho: $${splitAmount.toLocaleString('pt-BR')} cada.`, width / 2, 375);
    } else {
        ctx.fillText('Ninguém clicou a tempo.', width / 2, 340);
        ctx.fillStyle = '#FF3333';
        ctx.fillText('O dinheiro foi devolvido ao cofre do Magnata.', width / 2, 375);
    }

    // Borda Externa do Canvas
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, width, height);

    return canvas.toBuffer();
}