import { createCanvas, loadImage, registerFont } from 'canvas';

export async function generateReceipt(fromUser, toUser, amount) {
    const canvas = createCanvas(600, 300);
    const ctx = canvas.getContext('2d');

    // Fundo Premium
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 600, 300);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, 600, 300);

    // Avatares
    const fromAvatar = await loadImage(fromUser.displayAvatarURL({ extension: 'png' }));
    const toAvatar = await loadImage(toUser.displayAvatarURL({ extension: 'png' }));

    ctx.drawImage(fromAvatar, 50, 80, 100, 100);
    ctx.drawImage(toAvatar, 450, 80, 100, 100);

    // Texto
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RECIBO DE TRANSFERÊNCIA', 300, 40);
    
    ctx.font = '20px Arial';
    ctx.fillText(`${fromUser.username}  ➔  ${toUser.username}`, 300, 130);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(`$${amount.toLocaleString()}`, 300, 200);

    return canvas.toBuffer();
}