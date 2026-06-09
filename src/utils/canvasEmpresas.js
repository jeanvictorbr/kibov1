import { createCanvas } from 'canvas';
import { businesses } from './businessConfig.js';

export async function generateMarketCanvas(ownedIds = []) {
    const keys = Object.keys(businesses);
    const businessesPerRow = 2; // DEFINIÇÃO DE 2 COLUNAS
    const totalRows = Math.ceil(keys.length / businessesPerRow);

    const canvasWidth = 900; // Maior largura para caber 2 colunas
    const canvasHeight = 350 + (totalRows * 280); // Altura dinâmica aumentada
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Fundo Premium Black
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // TÍTULO GIGANTE
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 45px Arial'; // Texto muito maior
    ctx.fillText('🏢 MERCADO IMOBILIARIO OFICIAL', 50, 70);
    
    // Subtítulo
    ctx.fillStyle = '#888899';
    ctx.font = 'bold 20px Arial'; // Aumentado
    ctx.fillText('Adquira exclusividade do sistema. Apenas UM DONO por empresa!', 50, 110);

    // AVISO EXPLÍCITO DE REGRA (VERMELHO)
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 22px Arial'; // Aumentado
    ctx.fillText('⚠️ REGRA DE OURO: NAO DEIXE PASSAR 48H SEM COLETAR!', 50, 160);
    ctx.fillText('A empresa FALE automaticamente e voce PERDE TUDO!', 50, 195);

    // Linha divisória
    ctx.strokeStyle = '#22252c';
    ctx.beginPath(); ctx.moveTo(50, 240); ctx.lineTo(canvasWidth - 50, 240); ctx.stroke();

    // VARIÁVEIS DO LAYOUT DE GRID
    const paddingX = 50;
    const paddingY = 280;
    const boxWidth = 380; // Caixas quadradas largas
    const boxHeight = 230; // Caixas quadradas altas

    keys.forEach((key, index) => {
        const b = businesses[key];
        const isOwned = ownedIds.includes(key);
        
        // CÁLCULO DE COLUNA E LINHA
        const col = index % businessesPerRow; 
        const row = Math.floor(index / businessesPerRow); 
        
        // Posição X e Y
        const x = paddingX + (col * (boxWidth + 40)); 
        const y = paddingY + (row * (boxHeight + 40));

        // DESENHAR CAIXA QUADRADA
        ctx.fillStyle = '#11131a';
        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.strokeStyle = isOwned ? '#FF4444' : '#FFD700'; // Vermelho se tiver dono, Dourado se livre
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, boxWidth, boxHeight);

        // NOME DA EMPRESA (FONTE GRANDE DENTRO DA CAIXA)
        ctx.fillStyle = isOwned ? '#888899' : '#FFD700';
        ctx.font = 'bold 30px Arial'; // FONTE GRANDE
        ctx.fillText(b.name.toUpperCase(), x + 20, y + 45);

        // STATUS E VALOR
        if (isOwned) {
            ctx.fillStyle = '#FF4444';
            ctx.font = 'bold 20px Courier New'; // Aumentado
            ctx.fillText(`[ INDISPONIVEL ]`, x + 20, y + 80);
        } else {
            ctx.fillStyle = '#FFFFFF'; 
            ctx.font = 'bold 20px Courier New'; // Aumentado
            ctx.fillText(`VALOR: $${b.price.toLocaleString()}`, x + 20, y + 80);
        }

        // DADOS FINANCEIROS CENTRALIZADOS
        ctx.fillStyle = '#AAAAAA';
        ctx.font = 'bold 18px Arial'; // Aumentado
        ctx.fillText(`RECEITA DIARIA:`, x + 20, y + 120);
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 22px Arial'; // FONTE GRANDE DE LUCRO
        ctx.fillText(`+ $${b.revenue.toLocaleString()}`, x + 20, y + 150);

        ctx.fillStyle = '#AAAAAA';
        ctx.font = 'bold 18px Arial'; // Aumentado
        ctx.fillText(`CUSTO DIARIO:`, x + 20, y + 190);
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 22px Arial'; // FONTE GRANDE DE CUSTO
        ctx.fillText(`- $${b.maintenance.toLocaleString()}`, x + 20, y + 215);
    });

    return canvas.toBuffer();
}

export async function generatePortfolioCanvas(user, userBiz) {
    // Portfólio continua em 1 coluna mas com fontes massivas
    const canvasWidth = 750;
    const canvasHeight = 280 + (Math.max(userBiz.length, 1) * 150);
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 45px Arial';
    ctx.fillText('IMPÉRIO DE ' + user.username.toUpperCase(), 50, 70);
    
    // AVISO EXPLÍCITO NO PORTFÓLIO (FONTE GRANDE)
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 22px Arial'; 
    ctx.fillText('⚠️ ATENÇÃO: NÃO DEIXE PASSAR 48H SEM COLETAR!', 50, 115);
    ctx.fillText('Se a empresa falir, você perde tudo e ela volta pro mercado!', 50, 150);

    if (userBiz.length === 0) {
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 28px Arial'; // FONTE GRANDE
        ctx.fillText('Você não possui nenhuma empresa ativa. Compre no Mercado.', 50, 220);
        return canvas.toBuffer();
    }

    userBiz.forEach((ub, index) => {
        const b = businesses[ub.businessId];
        const y = 180 + (index * 150); // Caixas maiores
        const horas = (Date.now() - new Date(ub.lastCollected)) / 3600000;

        ctx.fillStyle = '#1f2229';
        ctx.fillRect(50, y, 650, 130);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 30px Arial'; // FONTE GRANDE
        ctx.fillText(b.name, 70, y + 50);

        ctx.font = 'bold 22px Courier New'; // FONTE GRANDE
        if (horas > 48) {
            ctx.fillStyle = '#FF4444';
            ctx.fillText('⚠️ FALIU POR FALTA DE MANUTENÇÃO', 70, y + 90);
        } else if (horas >= 24) {
            ctx.fillStyle = '#00FF66';
            ctx.fillText('✅ LUCRO DISPONÍVEL PARA COLETAR', 70, y + 90);
        } else {
            ctx.fillStyle = '#888899';
            ctx.fillText(`⏳ Aguarde ${Math.ceil(24 - horas)}h para coletar`, 70, y + 90);
        }
    });

    return canvas.toBuffer();
}