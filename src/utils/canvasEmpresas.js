import { createCanvas } from 'canvas';
import { businesses } from './businessConfig.js';

export async function generateMarketCanvas(ownedIds = []) {
    const keys = Object.keys(businesses);
    // Altura dinâmica aumentada para caber tudo perfeitamente
    const canvas = createCanvas(750, 240 + (keys.length * 150)); 
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 35px Arial';
    ctx.fillText('MERCADO IMOBILIARIO OFICIAL', 40, 60);
    
    ctx.fillStyle = '#888899';
    ctx.font = '16px Arial';
    ctx.fillText('Compre empresas exclusivas do sistema. So pode existir UM DONO por empresa!', 40, 90);

    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('ATENCAO: Se nao pagar a manutencao e coletar os lucros em 48h, a empresa', 40, 125);
    ctx.fillText('FALE e volta automaticamente para o mercado para outros comprarem!', 40, 145);

    keys.forEach((key, index) => {
        const b = businesses[key];
        const y = 180 + (index * 150);
        const isOwned = ownedIds.includes(key);

        ctx.fillStyle = '#11131a';
        ctx.fillRect(40, y, 670, 130);
        ctx.strokeStyle = isOwned ? '#FF4444' : '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, y, 670, 130);

        ctx.fillStyle = isOwned ? '#888899' : '#FFD700';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(b.name.toUpperCase(), 60, y + 35);

        ctx.fillStyle = '#AAAAAA';
        ctx.font = '14px Arial';
        ctx.fillText(b.desc, 60, y + 60);

        if (isOwned) {
            ctx.fillStyle = '#FF4444';
            ctx.font = 'bold 18px Courier New';
            ctx.fillText(`[ INDISPONIVEL - JA POSSUI DONO ]`, 60, y + 90);
        } else {
            ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 16px Courier New';
            ctx.fillText(`VALOR: $${b.price.toLocaleString()}`, 60, y + 90);
        }

        // Custo e receita rebaixados para não encavalar
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`RECEITA: +$${b.revenue.toLocaleString()}/dia`, 60, y + 115);

        ctx.fillStyle = '#FF4444';
        ctx.fillText(`CUSTO: -$${b.maintenance.toLocaleString()}/dia`, 350, y + 115);
    });

    return canvas.toBuffer();
}

export async function generatePortfolioCanvas(user, userBiz) {
    const canvas = createCanvas(750, 240 + (Math.max(userBiz.length, 1) * 110));
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 35px Arial';
    ctx.fillText('IMPERIO DE ' + user.username.toUpperCase(), 40, 60);
    
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('ATENCAO: NAO DEIXE PASSAR 48H SEM COLETAR!', 40, 100);
    ctx.fillText('Se a empresa falir, voce perde tudo e ela volta pro mercado!', 40, 120);

    if (userBiz.length === 0) {
        ctx.fillStyle = '#FF4444';
        ctx.font = '20px Arial';
        ctx.fillText('Voce nao possui nenhuma empresa. Compre no mercado.', 40, 180);
        return canvas.toBuffer();
    }

    userBiz.forEach((ub, index) => {
        const b = businesses[ub.businessId];
        const y = 160 + (index * 110);
        const horas = (Date.now() - new Date(ub.lastCollected)) / 3600000;

        ctx.fillStyle = '#1f2229';
        ctx.fillRect(40, y, 670, 90);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(b.name, 60, y + 35);

        ctx.font = 'bold 16px Courier New';
        if (horas > 48) {
            ctx.fillStyle = '#FF4444';
            ctx.fillText('FALIU POR FALTA DE MANUTENCAO (Sera perdida ao coletar)', 60, y + 65);
        } else if (horas >= 24) {
            ctx.fillStyle = '#00FF66';
            ctx.fillText('LUCRO DISPONIVEL PARA COLETAR', 60, y + 65);
        } else {
            ctx.fillStyle = '#888899';
            ctx.fillText(`Aguarde ${Math.ceil(24 - horas)}h para coletar`, 60, y + 65);
        }
        
        // Indicador se está à venda
        if (ub.forSalePrice) {
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`[ A VENDA POR $${ub.forSalePrice.toLocaleString()} ]`, 400, y + 35);
        }
    });

    return canvas.toBuffer();
}