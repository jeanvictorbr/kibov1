import { createCanvas, loadImage } from 'canvas';

export async function generateCdCanvas(user, statusList) {
    const canvas = createCanvas(450, 450);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, 450, 450);
    
    // Borda Cinza Elegante
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 430, 430);

    // Glow Neon Inferior
    ctx.shadowColor = '#444444';
    ctx.shadowBlur = 25;
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(20, 430); ctx.lineTo(430, 430); ctx.stroke();
    ctx.shadowBlur = 0;

    // Avatar
    try {
        const img = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
        ctx.save();
        ctx.beginPath(); ctx.arc(225, 70, 40, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(img, 185, 30, 80, 80); ctx.restore();
    } catch(e) {}

    // Título
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAINEL DE COOLDOWNS', 225, 140);

    // Lista
    let startY = 200;
    statusList.forEach((item, index) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.command.toUpperCase(), 80, startY + (index * 50));
        
        ctx.textAlign = 'right';
        if (item.status === 'active') {
            const horas = Math.ceil((new Date(item.expiresAt) - new Date()) / 3600000);
            ctx.fillStyle = '#FF4444'; // Vermelho para ocupado
            ctx.fillText(`${horas}h restante`, 370, startY + (index * 50));
        } else {
            ctx.fillStyle = '#00FF66'; // Verde para disponível
            ctx.fillText('DISPONÍVEL', 370, startY + (index * 50));
        }
    });

    return canvas.toBuffer();
}