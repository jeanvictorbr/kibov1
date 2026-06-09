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
// 2. COMPROVANTE BANCÁRIO (KIBO BANK) - O NOVO HD!
// ---------------------------------------------------------
export async function generatePixReceipt(senderUser, targetUser, amount, transactionId) {
    // Aumentado a largura para caber a foto e os textos na mesma linha
    const width = 600;
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

    // --- LOGOMARCA DO BANCO (Sem emoji para não bugar no Linux) ---
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('KIBO BANK', width / 2, 65);
    ctx.fillStyle = '#00FF66';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('COMPROVANTE DE TRANSFERÊNCIA PIX', width / 2, 90);

    // --- INFORMAÇÃO DE VALOR ---
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText('VALOR ENVIADO', width / 2, 150);
    ctx.fillStyle = '#00FF66';
    ctx.font = 'bold 60px Courier New';
    ctx.fillText(`$${amount.toLocaleString('pt-BR')}`, width / 2, 210);

    // Linha divisória
    ctx.strokeStyle = '#22252c';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(40, 250); ctx.lineTo(width - 40, 250); ctx.stroke();

    // --- AVATAR DO REMETENTE (Com Efeito Glow) ---
    try {
        const avatarUrl = senderUser.displayAvatarURL({ extension: 'png', size: 128 });
        const img = await loadImage(avatarUrl);
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 360, 55, 0, Math.PI * 2, true); // Círculo de corte
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 45, 305, 110, 110); // Desenha a imagem dentro
        ctx.restore();

        // Borda Branca com Sombra/Brilho
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 15; // Brilho em volta da foto
        ctx.beginPath();
        ctx.arc(100, 360, 55, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.shadowBlur = 0; // Reseta a sombra para os próximos textos
    } catch (e) { 
        console.error("Erro ao carregar avatar do PIX:", e); 
    }

    // --- DADOS DA TRANSFERÊNCIA (Alinhados à direita do Avatar) ---
    ctx.textAlign = 'left';
    const textX = 180; // Posição X onde começam os textos
    
    // Remetente
    ctx.fillStyle = '#888899';
    ctx.font = '18px Arial';
    ctx.fillText('REMETENTE:', textX, 320);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(senderUser.username.toUpperCase(), textX + 125, 320);

    // Destinatário
    ctx.fillStyle = '#888899';
    ctx.font = '18px Arial';
    ctx.fillText('DESTINATÁRIO:', textX, 370);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(targetUser.username.toUpperCase(), textX + 150, 370);

    // Instituição
    ctx.fillStyle = '#888899';
    ctx.font = '16px Arial';
    ctx.fillText('INSTITUIÇÃO:', textX, 420);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText('Kibo Bank S.A. (Transação Eletrônica)', textX + 115, 420);

    // Linha divisória 2
    ctx.strokeStyle = '#22252c';
    ctx.beginPath(); ctx.moveTo(40, 470); ctx.lineTo(width - 40, 470); ctx.stroke();

    // --- RODAPÉ (SEGURANÇA E DATA) ---
    const now = new Date();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#888899';
    ctx.font = '14px Arial';
    ctx.fillText(`ID DA TRANSAÇÃO: ${transactionId.toUpperCase()}`, width / 2, 505);
    ctx.fillText(`DATA: ${now.toLocaleDateString('pt-BR')} | HORA: ${now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, width / 2, 525);

    return canvas.toBuffer();
}