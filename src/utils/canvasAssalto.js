import { createCanvas, loadImage } from 'canvas';

export async function gerarCanvasAssalto(avatarUrl, status, loot) {
    const canvas = createCanvas(800, 300);
    const ctx = canvas.getContext('2d');

    // Fundo do submundo (Dark Theme)
    ctx.fillStyle = '#1A1C20';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Efeito de grade (Estilo banco/cofre)
    ctx.strokeStyle = '#2A2D34';
    ctx.lineWidth = 4;
    for(let i = 0; i < 800; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 300);
        ctx.stroke();
    }

    // Define as cores e os textos baseados na situação do minigame
    let color = '#FF8C00'; // Laranja (Padrão: Em Andamento)
    let textStatus = 'ASSALTO EM ANDAMENTO...';
    
    if (status === 'preso') { 
        color = '#FF0000'; // Vermelho
        textStatus = '🚨 BUSTED! PERDEU PLAYBOY!'; 
    } else if (status === 'fuga') { 
        color = '#00FF66'; // Verde
        textStatus = '💨 FUGA BEM SUCEDIDA!'; 
    }

    // Barra lateral de sinalização
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 25, 300);

    // Desenha o Avatar do meliante (redondo com borda)
    try {
        const avatar = await loadImage(avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(130, 150, 75, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 55, 75, 150, 150);
        ctx.restore();

        // Borda do avatar
        ctx.beginPath();
        ctx.arc(130, 150, 75, 0, Math.PI * 2);
        ctx.lineWidth = 10;
        ctx.strokeStyle = color;
        ctx.stroke();
    } catch(e) {
        // Fallback
    }

    // Textos do Banner (Ajustado pra não cortar)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px sans-serif'; 
    ctx.fillText(textStatus, 240, 120);

    ctx.fillStyle = '#AAAAAA';
    ctx.font = '30px sans-serif';
    ctx.fillText('Valor no Malote:', 240, 180);

    // O Dinheiro piscando na tela (Maior e chamativo)
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(`$${loot.toLocaleString('pt-BR')}`, 240, 240);

    return canvas.toBuffer();
}