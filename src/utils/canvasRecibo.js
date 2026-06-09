import { createCanvas, loadImage } from 'canvas';

// ---------------------------------------------------------
// 1. RECIBO DA LOJA (KIBO STORE) - NÃO MEXER
// ---------------------------------------------------------
export async function generateReceipt(user, amount, itemName) {
    const width = 400;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#FF4444';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('KIBO STORE', width / 2, 60);
    ctx.fillStyle = '#FF4444';
    ctx.font = '14px Arial';
    ctx.fillText('RECIBO DE COMPRA', width / 2, 85);

    try {
        const img = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
        ctx.save();
        ctx.beginPath(); ctx.arc(width / 2, 180, 50, 0, Math.PI * 2, true); ctx.closePath(); ctx.clip();
        ctx.drawImage(img, (width / 2) - 50, 130, 100, 100); ctx.restore();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(width / 2, 180, 50, 0, Math.PI * 2, true); ctx.stroke();
    } catch (e) { console.error("Erro ao carregar avatar"); }

    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 16px Arial'; ctx.fillText(user.username, width / 2, 260);

    ctx.strokeStyle = '#22252c'; ctx.beginPath(); ctx.moveTo(50, 290); ctx.lineTo(width - 50, 290); ctx.stroke();

    ctx.fillStyle = '#FF4444'; ctx.font = 'bold 45px Arial'; ctx.fillText(`-$${amount.toLocaleString('pt-BR')}`, width / 2, 350);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 22px Arial'; ctx.fillText(`ITEM: ${itemName.toUpperCase()}`, width / 2, 390);

    const now = new Date();
    ctx.fillStyle = '#888899'; ctx.font = '12px Arial'; 
    ctx.fillText(`DATA: ${now.toLocaleDateString('pt-BR')} | HORA: ${now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, width / 2, 450);

    return canvas.toBuffer();
}

// ---------------------------------------------------------
// 2. COMPROVANTE BANCÁRIO (KIBO BANK) - O NOVO!
// ---------------------------------------------------------
export async function generatePixReceipt(senderUser, targetUser, amount, transactionId) {
    const width = 450;
    const height = 550;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo Premium Black
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, width, height);

    // Borda Verde (Sucesso Financeiro)
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // --- LOGOMARCA DO BANCO ---
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('🏦 KIBO BANK', width / 2, 60);
    ctx.fillStyle = '#00FF66';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('COMPROVANTE DE TRANSFERÊNCIA PIX', width / 2, 85);

    // --- INFORMAÇÃO DE VALOR ---
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('VALOR ENVIADO', width / 2, 140);
    ctx.fillStyle = '#00FF66';
    ctx.font = 'bold 50px Courier New';
    ctx.fillText(`$${amount.toLocaleString('pt-BR')}`, width / 2, 190);

    // Linha divisória
    ctx.strokeStyle = '#22252c';
    ctx.beginPath(); ctx.moveTo(40, 230); ctx.lineTo(width - 40, 230); ctx.stroke();

    // --- DADOS DA TRANSFERÊNCIA ---
    ctx.textAlign = 'left';
    
    ctx.fillStyle = '#888899';
    ctx.font = '14px Arial';
    ctx.fillText('REMETENTE:', 50, 280);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(senderUser.username.toUpperCase(), 50, 305);

    ctx.fillStyle = '#888899';
    ctx.font = '14px Arial';
    ctx.fillText('DESTINATÁRIO:', 50, 350);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(targetUser.username.toUpperCase(), 50, 375);

    ctx.fillStyle = '#888899';
    ctx.font = '14px Arial';
    ctx.fillText('INSTITUIÇÃO:', 50, 420);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Kibo Bank S.A. (Transação Eletrônica)', 50, 440);

    // Linha divisória 2
    ctx.strokeStyle = '#22252c';
    ctx.beginPath(); ctx.moveTo(40, 470); ctx.lineTo(width - 40, 470); ctx.stroke();

    // --- RODAPÉ (SEGURANÇA E DATA) ---
    const now = new Date();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#888899';
    ctx.font = '12px Arial';
    ctx.fillText(`ID DA TRANSAÇÃO: ${transactionId.toUpperCase()}`, width / 2, 500);
    ctx.fillText(`DATA: ${now.toLocaleDateString('pt-BR')} | HORA: ${now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, width / 2, 520);

    return canvas.toBuffer();
}