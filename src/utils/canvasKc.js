import { createCanvas, loadImage } from 'canvas';

export async function generateKcCanvas(user, userData) {
    const width = 450;
    const height = 650;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo Premium (Deep Black)
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    // Borda Neon (Estilo Kibo Cash)
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Header
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('KIBO CASH', width / 2, 70);
    ctx.fillStyle = '#00FF66';
    ctx.font = '16px Arial';
    ctx.fillText('STATUS: ATIVO', width / 2, 95);

    // Avatar Circular com Brilho Neon
    try {
        const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.save();
        ctx.shadowColor = '#00FF66';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(width / 2, 220, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, width / 2 - 80, 140, 160, 160);
        ctx.restore();
    } catch (e) {}

    // Nome
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(user.username, width / 2, 330);

    // Bloco de Saldos (Efeito Neon)
    const drawSaldo = (label, value, y) => {
        ctx.fillStyle = '#888899';
        ctx.font = '14px Arial';
        ctx.fillText(label, width / 2, y);
        ctx.fillStyle = '#00FF66';
        ctx.shadowColor = '#00FF66';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 28px Courier New';
        ctx.fillText(`$ ${value.toLocaleString('pt-BR')}`, width / 2, y + 35);
        ctx.shadowBlur = 0;
    };

    drawSaldo('CARTEIRA', userData.balance, 410);
    drawSaldo('BANCO', userData.bank, 490);
    drawSaldo('KIBO CASH', userData.kiboCash, 570);

    return canvas.toBuffer();
}