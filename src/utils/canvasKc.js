import { createCanvas, loadImage } from 'canvas';

export async function generateKcCanvas(user, userData) {
    const canvas = createCanvas(450, 650);
    const ctx = canvas.getContext('2d');

    // Fundo Profissional
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, 450, 650);
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 410, 610);

    // Avatar
    try {
        const img = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(225, 150, 60, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 165, 90, 120, 120);
        ctx.restore();
    } catch(e) {}

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 30px Arial';
    ctx.fillText(user.username, 225, 250);

    // Saldos Neon
    const drawLine = (label, val, y) => {
        ctx.fillStyle = '#888899'; ctx.font = '16px Arial'; ctx.fillText(label, 225, y);
        ctx.fillStyle = '#00FF66'; ctx.font = 'bold 28px Courier New'; ctx.fillText(`$ ${val.toLocaleString()}`, 225, y + 35);
    };

    drawLine('CARTEIRA', userData.balance, 350);
    drawLine('BANCO', userData.bank, 450);
    drawLine('KIBO CASH', userData.kiboCash || 0, 550);

    return canvas.toBuffer();
}