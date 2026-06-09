import { createCanvas, loadImage } from 'canvas';

export async function generateExtratoCanvas(user, transactions, page) {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Fundo Premium
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, 800, 600);

    // Borda Dourada Luxuosa
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, 800, 600);

    // Cabeçalho
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('EXTRATO BANCÁRIO', 40, 70);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Titular: ${user.username}`, 40, 100);

    // Linha divisória
    ctx.strokeStyle = '#333333';
    ctx.beginPath(); ctx.moveTo(40, 130); ctx.lineTo(760, 130); ctx.stroke();

    let startY = 180;
    for (const t of transactions) {
        const isSender = t.fromUserId === user.id;
        const targetName = isSender ? t.toUserName : t.fromUserName;
        const targetAvatar = isSender ? t.toUserAvatar : t.fromUserAvatar;

        // Desenhar Avatar Pequeno
        try {
            const avatar = await loadImage(targetAvatar);
            ctx.save();
            ctx.beginPath();
            ctx.arc(60, startY - 15, 20, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, 40, startY - 35, 40, 40);
            ctx.restore();
        } catch (e) {}

        // Texto da Transação
        ctx.fillStyle = isSender ? '#FF5555' : '#55FF55';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(isSender ? 'PIX ENVIADO' : 'PIX RECEBIDO', 100, startY - 10);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(targetName, 280, startY - 10);

        ctx.fillStyle = isSender ? '#FF5555' : '#55FF55';
        ctx.fillText(`${isSender ? '-' : '+'} $${t.amount.toLocaleString()}`, 600, startY - 10);

        startY += 60;
    }

    return canvas.toBuffer();
}