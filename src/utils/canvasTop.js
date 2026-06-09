import { createCanvas, loadImage } from 'canvas';

export async function generateTopCanvas(topUsers) {
    const canvasWidth = 600;
    const itemHeight = 80;
    const canvasHeight = (topUsers.length * itemHeight) + 120; // 120 para o cabeçalho
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Fundo
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Título
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 35px Arial';
    ctx.fillText('🏆 RANKING DE MILIONÁRIOS', 30, 60);

    // Desenhar cada usuário
    for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        const y = 100 + (i * itemHeight);

        // Posição
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = i < 3 ? '#ffcc00' : '#888888';
        ctx.fillText(`#${i + 1}`, 30, y + 45);

        // Avatar
        try {
            const avatar = await loadImage(user.avatarUrl);
            ctx.save();
            ctx.beginPath();
            ctx.arc(100, y + 35, 25, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 75, y + 10, 50, 50);
            ctx.restore();
        } catch (e) { /* Caso não carregue o avatar */ }

        // Nome
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText(user.username.length > 15 ? user.username.substring(0,12) + '...' : user.username, 140, y + 45);

        // Saldo
        ctx.fillStyle = '#4dff88';
        ctx.textAlign = 'right';
        ctx.fillText(`$${user.balance.toLocaleString()}`, 570, y + 45);
        ctx.textAlign = 'left';
    }

    return canvas.toBuffer();
}