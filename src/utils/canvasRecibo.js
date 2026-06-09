import { createCanvas, loadImage } from 'canvas';

export async function generateReceipt(user, amount) {
    const width = 400;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo Premium
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, width, height);

    // Borda Neon (Indica saída de dinheiro)
    ctx.strokeStyle = '#FF4444';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // --- LOGOMARCA ---
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('KIBO STORE', width / 2, 60);
    ctx.fillStyle = '#FF4444';
    ctx.font = '14px Arial';
    ctx.fillText('RECIBO DE COMPRA', width / 2, 85);

    // --- AVATAR DO COMPRADOR ---
    try {
        const img = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, 180, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, (width / 2) - 50, 130, 100, 100);
        ctx.restore();
        
        // Borda do avatar
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(width / 2, 180, 50, 0, Math.PI * 2, true);
        ctx.stroke();
    } catch (e) { console.error("Erro ao carregar avatar no recibo"); }

    // Nome do Comprador
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(user.username, width / 2, 260);

    // Linha divisória
    ctx.strokeStyle = '#22252c';
    ctx.beginPath(); ctx.moveTo(50, 290); ctx.lineTo(width - 50, 290); ctx.stroke();

    // Valor (Em vermelho e com sinal de negativo)
    ctx.fillStyle = '#FF4444';
    ctx.shadowColor = '#FF4444';
    ctx.shadowBlur = 10;
    ctx.font = 'bold 50px Arial';
    ctx.fillText(`-$${amount.toLocaleString('pt-BR')}`, width / 2, 360);
    ctx.shadowBlur = 0;

    // Data e Hora
    const now = new Date();
    ctx.fillStyle = '#888899';
    ctx.font = '12px Arial';
    ctx.fillText(`DATA: ${now.toLocaleDateString('pt-BR')} | HORA: ${now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, width / 2, 420);

    // Footer
    ctx.fillStyle = '#22252c';
    ctx.font = '10px Arial';
    ctx.fillText('PRODUTO ADICIONADO AO INVENTÁRIO.', width / 2, 460);

    return canvas.toBuffer();
}