import { createCanvas, loadImage } from 'canvas';

export async function generateReceipt(fromUser, toUser, amount) {
    const width = 450;
    const height = 650;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo Premium
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, width, height);

    // Borda Neon Verde (Status Concluído)
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // --- LOGOMARCA ---
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('KIBO BANK', width / 2, 60);
    ctx.fillStyle = '#00FF66';
    ctx.font = '14px Arial';
    ctx.fillText('SISTEMA FINANCEIRO PRIVADO', width / 2, 85);

    // --- AVATARES CIRCULARES ---
    const drawAvatar = async (user, x, y) => {
        try {
            const img = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + 40, y + 40, 40, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, x, y, 80, 80);
            ctx.restore();
            
            // Borda do avatar
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + 40, y + 40, 40, 0, Math.PI * 2, true);
            ctx.stroke();
        } catch (e) { console.error("Erro ao carregar avatar no recibo"); }
    };

    await drawAvatar(fromUser, 80, 150);
    await drawAvatar(toUser, 290, 150);

    // Texto dos nomes
    ctx.fillStyle = '#888899';
    ctx.font = '12px Arial';
    ctx.fillText('DE:', 120, 250);
    ctx.fillText('PARA:', 330, 250);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(fromUser.username.substring(0, 10), 120, 270);
    ctx.fillText(toUser.username.substring(0, 10), 330, 270);

    // Linha divisória
    ctx.strokeStyle = '#22252c';
    ctx.beginPath(); ctx.moveTo(50, 310); ctx.lineTo(width - 50, 310); ctx.stroke();

    // ID da Transação
    const genId = () => `KIBO-${Math.random().toString(36).substring(2, 5).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    ctx.fillStyle = '#888899';
    ctx.font = '12px Arial';
    ctx.fillText('ID DA TRANSAÇÃO', width / 2, 350);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Courier New';
    ctx.fillText(genId(), width / 2, 375);

    // Valor Central Neon
    ctx.fillStyle = '#00FF66';
    ctx.shadowColor = '#00FF66';
    ctx.shadowBlur = 15;
    ctx.font = 'bold 50px Arial';
    ctx.fillText(`$${amount.toLocaleString('pt-BR')}`, width / 2, 460);
    ctx.shadowBlur = 0;

    // Data e Hora
    const now = new Date();
    ctx.fillStyle = '#888899';
    ctx.font = '14px Arial';
    ctx.fillText(`DATA: ${now.toLocaleDateString('pt-BR')}  |  HORA: ${now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, width / 2, 530);

    // Footer
    ctx.fillStyle = '#22252c';
    ctx.font = '10px Arial';
    ctx.fillText('COMPROVANTE EMITIDO AUTOMATICAMENTE PELO KIBO ENGINE.', width / 2, 620);

    return canvas.toBuffer();
}