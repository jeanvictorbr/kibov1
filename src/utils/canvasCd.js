import { createCanvas, loadImage } from 'canvas';

export async function generateCdCanvas(user, cooldowns) {
    const canvas = createCanvas(450, 450);
    const ctx = canvas.getContext('2d');

    // Fundo Premium
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, 450, 450);
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 430, 430);

    // Avatar
    try {
        const img = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(225, 70, 40, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 185, 30, 80, 80);
        ctx.restore();
    } catch(e) {}

    // Título
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAINEL DE COOLDOWNS', 225, 140);

    // Listagem
    let startY = 190;
    if (cooldowns.length === 0) {
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('VOCÊ ESTÁ LIVRE, CHEFE!', 225, 250);
    } else {
        cooldowns.forEach((c, index) => {
            const horas = Math.ceil((new Date(c.expiresAt) - new Date()) / 3600000);
            
            ctx.fillStyle = '#888899';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(c.command.toUpperCase(), 80, startY + (index * 40));
            
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'right';
            ctx.fillText(`${horas} hora(s)`, 370, startY + (index * 40));
        });
    }

    return canvas.toBuffer();
}