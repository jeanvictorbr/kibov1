import { createCanvas, loadImage } from 'canvas';

export async function generateExtratoCanvas(user, transactions, page) {
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');

    // Fundo Premium
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, 800, 500);

    // Borda Kibo
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, 800, 500);

    // Cabeçalho
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 35px Arial';
    ctx.fillText('EXTRATO BANCÁRIO', 40, 60);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '25px Arial';
    ctx.fillText(`Titular: ${user.username}`, 40, 100);
    ctx.fillText(`Página: ${page}`, 650, 60);

    // Avatar do Titular (Canto Superior Direito)
    try {
        const avatar = await loadImage(user.displayAvatarURL({ extension: 'png' }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(700, 120, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 650, 70, 100, 100);
        ctx.restore();
    } catch (e) {}

    // Linha Divisória
    ctx.beginPath();
    ctx.moveTo(40, 140);
    ctx.lineTo(760, 140);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Loop de Transações (Suporta 7 por página)
    let startY = 190;
    if (transactions.length === 0) {
        ctx.fillStyle = '#AAAAAA';
        ctx.font = 'italic 25px Arial';
        ctx.fillText('Nenhuma movimentação encontrada nesta página.', 40, 250);
    } else {
        transactions.forEach(t => {
            const isSender = t.fromUserId === user.id;
            const typeText = isSender ? '📤 TRANSFERÊNCIA ENVIADA' : '📥 TRANSFERÊNCIA RECEBIDA';
            const color = isSender ? '#FF5555' : '#55FF55';
            const symbol = isSender ? '-' : '+';
            const date = new Date(t.timestamp).toLocaleDateString('pt-BR');

            // Tipo da Transação
            ctx.fillStyle = color;
            ctx.font = 'bold 20px Arial';
            ctx.fillText(typeText, 40, startY);

            // Valor
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Arial';
            ctx.fillText(`${symbol} $${t.amount.toLocaleString()}`, 400, startY);

            // Data
            ctx.fillStyle = '#AAAAAA';
            ctx.font = '18px Arial';
            ctx.fillText(date, 650, startY);

            startY += 45; // Desce a linha para a próxima transação
        });
    }

    return canvas.toBuffer();
}