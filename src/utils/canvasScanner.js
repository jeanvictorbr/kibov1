// Arquivo: src/utils/canvasScanner.js
import { createCanvas, loadImage } from 'canvas';

export async function generateScannerImage(targets) {
    // Cria a base do radar (800x500 pixels)
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');

    // Fundo Tático (Preto/Azul muito escuro)
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Efeito de Grade (Grid de Radar)
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 800; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 500); ctx.stroke();
    }
    for (let i = 0; i < 500; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(800, i); ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Cabeçalho do Radar
    ctx.fillStyle = '#00FF66';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📡 SCANNER CLANDESTINO - ALVOS DETECTADOS', 400, 50);

    // Efeito de linha divisória neon
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00FF66';
    ctx.fillRect(50, 70, 700, 2);
    ctx.shadowBlur = 0;

    // Desenha cada alvo
    let startY = 100;
    
    if (targets.length === 0) {
        ctx.fillStyle = '#FF0033';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('SINAL PERDIDO: NENHUM ALVO COM DINHEIRO VIVO.', 400, 250);
        return canvas.toBuffer();
    }

    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        
        // Caixa de interface do alvo
        ctx.fillStyle = 'rgba(0, 255, 102, 0.05)';
        ctx.strokeStyle = '#00FF66';
        ctx.lineWidth = 2;
        ctx.fillRect(50, startY, 700, 110);
        ctx.strokeRect(50, startY, 700, 110);

        // Puxa e recorta a foto de perfil do usuário (Avatar)
        try {
            const avatarImg = await loadImage(target.avatar);
            ctx.save();
            ctx.beginPath();
            ctx.arc(110, startY + 55, 40, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImg, 70, startY + 15, 80, 80);
            ctx.restore();
            
            // Borda neon na foto
            ctx.beginPath();
            ctx.arc(110, startY + 55, 40, 0, Math.PI * 2, true);
            ctx.strokeStyle = '#00FF66';
            ctx.lineWidth = 3;
            ctx.stroke();
        } catch (e) {
            console.error('Erro ao carregar avatar do scanner:', e);
        }

        // Textos: Nome do Alvo
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 26px Arial';
        ctx.fillText(target.tag, 170, startY + 45);

        // Textos: Estimativa de Dinheiro (Margem de erro)
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(`💸 Estimativa: $${target.min.toLocaleString('pt-BR')} ~ $${target.max.toLocaleString('pt-BR')}`, 170, startY + 85);

        // Carimbo lateral de "ALVO"
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FF0033';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`ALVO #${i + 1}`, 730, startY + 65);

        startY += 130; // Espaço para a próxima caixa
    }

    return canvas.toBuffer();
}