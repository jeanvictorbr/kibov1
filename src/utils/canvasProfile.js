import { createCanvas, loadImage } from 'canvas';

export async function generateProfileCanvas(discordUser, userData) {
    const canvas = createCanvas(800, 300);
    const ctx = canvas.getContext('2d');

    // 1. Fundo Premium
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, 800, 300);
    
    // Borda Dourada
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, 800, 300);

    // 2. Avatar Arredondado
    const avatar = await loadImage(discordUser.displayAvatarURL({ extension: 'png' }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(150, 150, 80, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 70, 70, 160, 160);
    ctx.restore();

    // 3. Informações (Texto)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 35px Arial';
    ctx.fillText(discordUser.username, 280, 100);

    ctx.fillStyle = '#FFD700';
    ctx.font = '25px Arial';
    ctx.fillText(`Saldo: $${userData.balance.toLocaleString()}`, 280, 150);
    ctx.fillText(`KiboCash: $${userData.kiboCash.toLocaleString()}`, 280, 185);

    // 4. Skills (Barra estilizada)
    const skills = typeof userData.skills === 'string' ? JSON.parse(userData.skills) : userData.skills;
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '20px Arial';
    ctx.fillText(`Sorte: ${skills.sorte || 1} | Lábia: ${skills.labia || 1}`, 280, 230);

    return canvas.toBuffer();
}