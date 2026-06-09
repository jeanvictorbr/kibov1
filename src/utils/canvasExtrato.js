import { createCanvas, loadImage } from 'canvas';

export async function generateExtratoCanvas(user, transactions, page) {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Fundo Premium Clean
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, 800, 600);

    // Borda Dourada Luxuosa
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, 800, 600);

    // Título no Topo
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('EXTRATO BANCÁRIO', 40, 70);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Titular: ${user.username}`, 40, 100);
    ctx.fillText(`Página: ${page}`, 700, 70);

    // Linha de separação
    ctx.strokeStyle = '#333333';
    ctx.beginPath(); ctx.moveTo(40, 130); ctx.lineTo(760, 130); ctx.stroke();

    let startY = 180;
    for (const t of transactions) {
        const isSender = t.fromUserId === user.id;
        // Se enviou, mostra para quem. Se recebeu, mostra de quem.
        const targetName = isSender ? `Para: ${t.toUserId}` : `De: ${t.fromUserId}`; // Dica: para nomes reais, precisaria fetchar o user
        
        ctx.fillStyle = isSender ? '#FF5555' : '#55FF55';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(isSender ? 'PIX ENVIADO' : 'PIX RECEBIDO', 40, startY);
        
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '16px Arial';
        ctx.fillText(targetName, 220, startY);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(`${isSender ? '-' : '+'} $${t.amount.toLocaleString()}`, 550, startY);

        startY += 50;
    }

    return canvas.toBuffer();
}