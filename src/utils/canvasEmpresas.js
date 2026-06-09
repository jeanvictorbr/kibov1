import { createCanvas } from 'canvas';
import { businesses } from './businessConfig.js';

export async function generateMarketCanvas(ownedIds = []) {
    const keys = Object.keys(businesses);
    const canvas = createCanvas(700, 240 + (keys.length * 130)); 
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 35px Arial';
    ctx.fillText('🏢 MERCADO IMOBILIÁRIO', 40, 60);
    
    ctx.fillStyle = '#888899';
    ctx.font = '16px Arial';
    ctx.fillText('Compre empresas exclusivas. Só pode existir UM DONO por empresa!', 40, 90);

    // AVISO EXPLÍCITO DE 48H
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('⚠️ REGRA DE OURO: Se não pagar a manutenção e coletar os lucros em 48h, a', 40, 125);
    ctx.fillText('empresa FALE e volta automaticamente para o mercado para outros comprarem!', 40, 145);

    keys.forEach((key, index) => {
        const b = businesses[key];
        const y = 180 + (index * 130);
        const isOwned = ownedIds.includes(key);

        ctx.fillStyle = '#11131a';
        ctx.fillRect(40, y, 620, 110);
        ctx.strokeStyle = isOwned ? '#FF4444' : '#FFD700'; // Vermelho se tiver dono, Dourado se livre
        ctx.lineWidth = 2;
        ctx.strokeRect(40, y, 620, 110);

        ctx.fillStyle = isOwned ? '#888899' : '#FFD700';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(b.name.toUpperCase(), 60, y + 35);

        ctx.fillStyle = '#AAAAAA';
        ctx.font = '14px Arial';
        ctx.fillText(b.desc, 60, y + 60);

        if (isOwned) {
            ctx.fillStyle = '#FF4444';
            ctx.font = 'bold 18px Courier New';
            ctx.fillText(`❌ INDISPONÍVEL (Já possui dono)`, 60, y + 90);
        } else {
            ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 16px Courier New';
            ctx.fillText(`VALOR: $${b.price.toLocaleString()}`, 60, y + 90);
        }

        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`RECEITA: +$${b.revenue.toLocaleString()}/dia`, 300, y + 90);

        ctx.fillStyle = '#FF4444';
        ctx.fillText(`CUSTO: -$${b.maintenance.toLocaleString()}/dia`, 300, y + 60);
    });

    return canvas.toBuffer();
}

export async function generatePortfolioCanvas(user, userBiz) {
    const canvas = createCanvas(700, 240 + (Math.max(userBiz.length, 1) * 110));
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 35px Arial';
    ctx.fillText('IMPÉRIO DE ' + user.username.toUpperCase(), 40, 60);
    
    // AVISO EXPLÍCITO NO PORTFÓLIO
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('⚠️ ATENÇÃO: NÃO DEIXE PASSAR 48H SEM COLETAR!', 40, 100);
    ctx.fillText('Se a empresa falir, você perde tudo e ela volta pro mercado!', 40, 120);

    if (userBiz.length === 0) {
        ctx.fillStyle = '#FF4444';
        ctx.font = '20px Arial';
        ctx.fillText('Você não possui nenhuma empresa. Compre no mercado.', 40, 180);
        return canvas.toBuffer();
    }

    userBiz.forEach((ub, index) => {
        const b = businesses[ub.businessId];
        const y = 160 + (index * 110);
        const horas = (Date.now() - new Date(ub.lastCollected)) / 3600000;

        ctx.fillStyle = '#1f2229';
        ctx.fillRect(40, y, 620, 90);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(b.name, 60, y + 35);

        ctx.font = 'bold 16px Courier New';
        if (horas > 48) {
            ctx.fillStyle = '#FF4444';
            ctx.fillText('⚠️ FALIU POR FALTA DE MANUTENÇÃO (Será perdida ao coletar)', 60, y + 65);
        } else if (horas >= 24) {
            ctx.fillStyle = '#00FF66';
            ctx.fillText('✅ LUCRO DISPONÍVEL PARA COLETAR', 60, y + 65);
        } else {
            ctx.fillStyle = '#888899';
            ctx.fillText(`⏳ Aguarde ${Math.ceil(24 - horas)}h para coletar`, 60, y + 65);
        }
    });

    return canvas.toBuffer();
}