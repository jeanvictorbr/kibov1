import { createCanvas, loadImage } from 'canvas';

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
    
    const themeColor = userData.isPremium ? '#00FFFF' : '#FFD700'; // Azul Neon para VIP, Dourado para Padrão

    // 1. FUNDO PREMIUM ESTILO LIKENESS DINÂMICO
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Efeito de Linhas de Dados Clandestinas (Simula fundo animado/tecnológico)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 25) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 100, canvas.height); ctx.stroke();
    }

    // Desenhar nós de rede brilhantes no fundo
    const nodes = [[100, 80], [750, 90], [400, 380], [800, 400], [50, 420]];
    nodes.forEach(([nx, ny]) => {
        ctx.fillStyle = themeColor + '15'; // Transparência do brilho
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
    ctx.shadowBlur = 0; // Desativa o blur global para não borrar os textos

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
        ctx.shadowColor = themeColor; ctx.shadowBlur = 15;
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

    ctx.fillStyle = themeColor;
    ctx.font = 'italic 20px Arial';
    ctx.fillText(userData.isPremium ? '💎 Magnata VIP' : 'Membro Padrão', 230, 120);

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
    // Aplica o wrap do texto para a bio respeitar as margens da caixa
    const mensagemBio = userData.bio || "Usa 'k bio' para alterares a tua biografia!";
    wrapText(ctx, mensagemBio, bioX + 15, bioY + 25, bioWidth - 30, 22);

    // 5. CARDS ECONÓMICOS
    const drawEconCard = (x, y, w, h, title, value, isSafe) => {
        drawRoundRect(ctx, x, y, w, h, 12);
        ctx.fillStyle = '#11131a';
        ctx.fill();

        const strokeColor = isSafe ? '#FFD700' : '#22252c';
        ctx.lineWidth = 2;
        ctx.strokeStyle = strokeColor;
        
        if (isSafe) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
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

    // 6. BARRA DE HABILIDADES (SKILLS)
    const skills = typeof userData.skills === 'string' ? JSON.parse(userData.skills) : userData.skills;
    
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