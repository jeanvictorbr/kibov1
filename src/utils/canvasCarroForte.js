import { createCanvas, loadImage } from 'canvas';

export async function gerarCanvasCarroForte(avatarUrl, fase) {
    // 🛠️ Aumentado para 900px de largura para caber todos os textos confortavelmente
    const canvas = createCanvas(900, 350); 
    const ctx = canvas.getContext('2d');

    // Fundo asfalto escuro
    ctx.fillStyle = '#1A1C20';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Faixas da rua
    ctx.fillStyle = '#F1C40F';
    for(let i = 20; i < 900; i += 100) {
        ctx.fillRect(i, 165, 60, 10);
    }

    // Configurações baseadas na fase do assalto
    let color = '#FF8C00'; 
    let titulo = '🚨 CARRO FORTE INTERCEPTADO!';
    let sub = 'A POLÍCIA TEM 3 MINUTOS!';

    if (fase === 'min1') {
        color = '#E67E22';
        titulo = '🔥 FOGO CRUZADO NA RODOVIA!';
        sub = 'TENTANDO ARROMBAR O COFRE...';
    } else if (fase === 'min2') {
        color = '#E74C3C'; // Vermelho piscante
        titulo = '⏳ C4 ARMADA! AFASTEM-SE!';
        sub = 'ÚLTIMOS SEGUNDOS PRO ESTOURO!';
    } else if (fase === 'sucesso') {
        color = '#00FF66';
        titulo = '💰 COFRE ABERTO! ROUBO CONCLUÍDO!';
        sub = 'O BONDE FUGIU COM OS MILHÕES!';
    } else if (fase === 'falha') {
        color = '#3498DB'; // Azul Polícia
        titulo = '🚓 ÁREA ISOLADA! POLÍCIA VENCEU!';
        sub = 'TODOS OS LADRÕES NEUTRALIZADOS!';
    }

    // Borda superior e inferior acompanhando a largura de 900px
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 900, 15);
    ctx.fillRect(0, 335, 900, 15);

    // Avatar do Líder do Assalto
    try {
        const avatar = await loadImage(avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(130, 175, 80, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 50, 95, 160, 160);
        ctx.restore();

        // Borda do Avatar
        ctx.beginPath();
        ctx.arc(130, 175, 80, 0, Math.PI * 2);
        ctx.lineWidth = 8;
        ctx.strokeStyle = color;
        ctx.stroke();
    } catch(e) {
        // Fallback caso a foto demore a baixar
    }

    // Textos Ajustados (Fonte um pouquinho menor e eixo X recalculado)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif'; 
    ctx.fillText(titulo, 250, 150);

    ctx.fillStyle = color;
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(sub, 250, 210);

    return canvas.toBuffer();
}