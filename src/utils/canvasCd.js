import { createCanvas, loadImage } from 'canvas';

export async function generateCdCanvas(user, cooldowns) {
    const canvas = createCanvas(450, 400);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, 450, 400);
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 430, 380);

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

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAINEL DE COOLDOWNS', 225, 140);

    let startY = 190;
    if (cooldowns.length === 0) {
        ctx.fillStyle = '#00FF66';
        ctx.fillText('VOCÊ ESTÁ LIVRE, CHEFE!', 225, 250);
    } else {
        cooldowns.forEach(c => {