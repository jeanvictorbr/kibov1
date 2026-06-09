import { createCanvas, loadImage } from 'canvas';

export async function generateTopCanvas(users) {
    const canvas = createCanvas(600, 750);
    const ctx = canvas.getContext('2d');

    // Fundo
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, 600, 750);

    // Título
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('RANKING DE RICOS', 50, 70);

    // Desenhar a lista
    let startY = 150;
    for (let i = 0; i < users.length; i++) {
        const u = users[i];
        
        // Posição
        ctx.fillStyle = '#888888';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`${i + 1}º`, 30, startY);

        // Avatar
        try {
            const img = await loadImage(u.avatar);
            ctx.save();
            ctx.beginPath();
            ctx.arc(100, startY - 15, 25, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, 75, startY - 40, 50, 50);
            ctx.restore();
        } catch(e) {}

        // Nome
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(u.username, 150, startY - 5);

        // Saldo
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 22px Courier New';
        ctx.textAlign = 'right';
        ctx.fillText(`$${u.balance.toLocaleString()}`, 570, startY - 5);
        ctx.textAlign = 'left';

        startY += 60;
    }

    return canvas.toBuffer();
}