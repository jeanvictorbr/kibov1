import { createCanvas, loadImage } from 'canvas';

export async function gerarCanvasCarroForte(avatarUrl, fase) {
    const canvas = createCanvas(800, 350);
    const ctx = canvas.getContext('2d');

    // Fundo asfalto escuro
    ctx.fillStyle = '#1A1C20';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Faixas da rua
    ctx.fillStyle = '#F1C40F';
    for(let i = 20; i < 800; i += 100) {
        ctx.fillRect(i, 165, 60, 10);
    }

    // Configurações baseadas na fase do assalto
    let color = '#FF8C00'; 
    let titulo = '🚨 CARRO FORTE INTERCEPTADO';
    let sub = 'A POLÍCIA TEM 3 MINUTOS!';

    if (fase === 'min1') {
        color = '#E67E22';
        titulo = '🔥 FOGO CRUZADO NA RODOVIA';
        sub = 'TENTANDO ARROMBAR O COFRE...';
    } else if (fase === 'min2') {
        color = '#E74C3C'; // Vermelho piscante
        titulo = '⏳ C4 ARMADA! AFASTEM-SE!';
        sub = 'ÚLTIMOS SEGUNDOS PRO ESTOURO!';
    } else if (fase === 'sucesso') {
        color = '#00FF66';
        titulo = '💰 COFRE ABERTO! ROUBO CONCLUÍDO';
        sub = 'O BONDE FUGIU COM OS MILHÕES!';
    } else if (fase === 'falha') {
        color = '#3498DB'; // Azul Polícia
        titulo = '🚓 ÁREA ISOLADA! POLÍCIA VENCEU';
        sub = 'TODOS OS LADRÕES NEUTRALIZADOS!';
    }

    // Borda superior e inferior
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 800, 15);
    ctx.fillRect(0, 335, 800, 15);

    // Avatar do Líder do Assalto
    try {
        const avatar = await loadImage(avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(120, 175, 80, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 40, 95, 160, 160);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(120, 175, 80, 0, Math.PI * 2);
        ctx.lineWidth = 8;
        ctx.strokeStyle = color;
        ctx.stroke();
    } catch(e) {}

    // Textos
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(titulo, 240, 150);

    ctx.fillStyle = color;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(sub, 240, 210);

    return canvas.toBuffer();
}