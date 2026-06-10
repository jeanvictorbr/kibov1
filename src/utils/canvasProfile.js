import { createCanvas, loadImage } from 'canvas';

// COLOQUE AQUI O SEU ID DO DISCORD
const CEO_IDS = ['1070658145740926987']; 

function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Função para quebrar o texto da bio em múltiplas linhas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
}

export async function generateProfileCanvas(discordUser, userData) {
    const canvas = createCanvas(850, 450);
    const ctx = canvas.getContext('2d');
    
    const isCEO = CEO_IDS.includes(discordUser.id);
    const isVip = userData.isPremium;

    const themeColor = isCEO ? '#FFD700' : (isVip ? '#00FFFF' : '#FFD700'); 

    // 1. FUNDO PREMIUM ESTILO LIKENESS DINÂMICO
    // CEO tem fundo preto mais denso para dar ar de exclusividade
    ctx.fillStyle = isCEO ? '#050505' : '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Efeito exclusivo do CEO (Luz Dourada no topo)
    if (isCEO) {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, 'rgba(255, 215, 0, 0.08)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Efeito de Linhas de Dados Clandestinas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 25) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 100, canvas.height); ctx.stroke();
    }

    // Desenhar nós de rede brilhantes no fundo
    const nodes = [[100, 80], [750, 90], [400, 380], [800, 400], [50, 420]];
    nodes.forEach(([nx, ny]) => {
        ctx.fillStyle = themeColor + '15'; 
        ctx.beginPath(); ctx.arc(nx, ny, 30, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = themeColor + '50';
        ctx.beginPath(); ctx.arc(nx, ny, 3, 0, Math.PI * 2); ctx.fill();
    });

    // Borda Principal com Brilho Neon
    ctx.lineWidth = 5;
    ctx.strokeStyle = themeColor;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 15;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0; 

    // 2. AVATAR CIRCULAR
    const avatarSize = 150;
    const avatarX = 50;
    const avatarY = 50;
    const centerX = avatarX + avatarSize / 2;
    const centerY = avatarY + avatarSize / 2;

    try {
        const avatar = await loadImage(discordUser.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.beginPath();
        ctx.arc(centerX, centerY, (avatarSize / 2) + 6, 0, Math.PI * 2, true);
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 4;
        
        // Sombra Dourada do Avatar se for o CEO
        ctx.shadowColor = themeColor; 
        ctx.shadowBlur = isCEO ? 25 : 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
    } catch (e) { console.error("Erro ao carregar avatar no perfil"); }

    // 3. TEXTOS DE IDENTIDADE
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px Arial';
    ctx.fillText(discordUser.username.toUpperCase(), 230, 90);

    // TAG de cargo customizada (Limpa e Funcional no Linux)
    if (isCEO) {
        ctx.fillStyle = themeColor;
        drawRoundRect(ctx, 230, 103, 110, 26, 6);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 15px Arial';
        ctx.fillText('CEO KIBO', 248, 122);
    } else {
        ctx.fillStyle = themeColor;
        ctx.font = 'italic 20px Arial';
        ctx.fillText(userData.isPremium ? '💎 Magnata VIP' : 'Membro Padrão', 230, 120);
    }

    // 4. CAIXA EXCLUSIVA DA BIOGRAFIA (BIO)
    const bioX = 230;
    const bioY = 140;
    const bioWidth = 570;
    const bioHeight = 65;

    drawRoundRect(ctx, bioX, bioY, bioWidth, bioHeight, 8);
    ctx.fillStyle = '#11131a';
    ctx.fill();
    ctx.strokeStyle = '#22252c';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#888899';
    ctx.font = 'italic 16px Arial';
    const mensagemBio = userData.bio || "Usa 'k bio' para alterares a tua biografia!";
    wrapText(ctx, mensagemBio, bioX + 15, bioY + 25, bioWidth - 30, 22);

    // 5. CARDS ECONÓMICOS EXATAMENTE COMO ERAM ANTES
    const drawEconCard = (x, y, w, h, title, value, isSafe) => {
        drawRoundRect(ctx, x, y, w, h, 12);
        ctx.fillStyle = '#11131a';
        ctx.fill();

        const strokeColor = isSafe ? '#FFD700' : '#22252c';
        ctx.lineWidth = 2;
        
        // CEO tem as caixas cinzas brilhando com leve tom de Ouro
        ctx.strokeStyle = (isCEO && !isSafe) ? '#333022' : strokeColor;
        
        if (isSafe || isCEO) {
            ctx.shadowColor = isSafe ? '#FFD700' : themeColor;
            ctx.shadowBlur = isSafe ? 10 : 3;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = isSafe ? '#FFD700' : '#888899';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(title, x + 15, y + 25);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`$${(value || 0).toLocaleString('pt-BR')}`, x + 15, y + 65);
    };

    drawEconCard(50, 230, 230, 90, 'CARTEIRA (Risco)', userData.balance, false);
    drawEconCard(310, 230, 230, 90, 'BANCO (Seguro)', userData.bank, true);
    drawEconCard(570, 230, 230, 90, 'KIBOCASH', userData.kiboCash, false);

    // 6. BARRA DE HABILIDADES ORIGINAL
    const skills = typeof userData.skills === 'string' ? JSON.parse(userData.skills) : (userData.skills || {});
    
    drawRoundRect(ctx, 50, 350, 750, 60, 10);
    ctx.fillStyle = '#11131a';
    ctx.fill();
    ctx.strokeStyle = '#22252c';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`HABILIDADES:`, 70, 387);

    ctx.fillStyle = '#00FFCC';
    ctx.shadowColor = '#00FFCC'; ctx.shadowBlur = 5;
    ctx.fillText(`Sorte: Nível ${skills.sorte || 1}`, 340, 387);
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#FF4444';
    ctx.shadowColor = '#FF4444'; ctx.shadowBlur = 5;
    ctx.fillText(`Lábia: Nível ${skills.labia || 1}`, 560, 387);
    ctx.shadowBlur = 0;

    return canvas.toBuffer();
}