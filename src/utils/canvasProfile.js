import { createCanvas, loadImage } from 'canvas';

// Função auxiliar "Blindada" para desenhar retângulos com bordas arredondadas no Canvas
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

export async function generateProfileCanvas(discordUser, userData) {
    const canvas = createCanvas(850, 450);
    const ctx = canvas.getContext('2d');

    // 1. Fundo Escuro Premium (Preto Azulado)
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Borda Principal (Efeito Neon Dourado)
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0; // Reset da sombra

    // Textura de Fundo (Linhas verticais sutis)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for(let i = 0; i < canvas.width; i+= 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }

    // 2. Avatar Magnata (com Anel de Luz)
    const avatarSize = 150;
    const avatarX = 50;
    const avatarY = 50;
    const centerX = avatarX + avatarSize / 2;
    const centerY = avatarY + avatarSize / 2;

    try {
        const avatar = await loadImage(discordUser.displayAvatarURL({ extension: 'png', size: 256 }));
        
        // Anel Neon Externo (Ciano se for VIP, Dourado se for Padrão)
        ctx.beginPath();
        ctx.arc(centerX, centerY, (avatarSize / 2) + 6, 0, Math.PI * 2, true);
        const ringColor = userData.isPremium ? '#00FFFF' : '#FFD700';
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 4;
        ctx.shadowColor = ringColor;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset

        // Máscara e Foto
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
    } catch (e) {
        console.error("Erro ao carregar avatar do perfil:", e);
    }

    // 3. Username e Patente
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px Arial';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
    ctx.shadowBlur = 10;
    ctx.fillText(discordUser.username.toUpperCase(), 230, 100);
    ctx.shadowBlur = 0;

    ctx.fillStyle = userData.isPremium ? '#00FFFF' : '#888899';
    ctx.font = 'italic 22px Arial';
    ctx.fillText(userData.isPremium ? '💎 Magnata VIP' : 'Membro Padrão', 230, 135);

    // 4. Cartões de Economia
    const drawEconCard = (x, y, w, h, title, value, isSafe) => {
        // Fundo do Card
        drawRoundRect(ctx, x, y, w, h, 12);
        ctx.fillStyle = '#11131a';
        ctx.fill();

        // Borda Neon (Dourado Forte pro Banco, Escuro pra Carteira)
        const strokeColor = isSafe ? '#FFD700' : '#22252c';
        ctx.lineWidth = 2;
        ctx.strokeStyle = strokeColor;
        
        if (isSafe) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Título do card (Aviso de Risco/Seguro)
        ctx.fillStyle = isSafe ? '#FFD700' : '#888899';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(title, x + 15, y + 25);

        // Valor do card formatado
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`$${(value || 0).toLocaleString('pt-BR')}`, x + 15, y + 65);
    };

    // Card 1: Carteira (Pode ser roubado)
    drawEconCard(50, 230, 230, 90, '💵 CARTEIRA (Risco)', userData.balance, false);
    
    // Card 2: Banco (Dinheiro Intocável)
    drawEconCard(310, 230, 230, 90, '🏦 BANCO (Seguro)', userData.bank, true);

    // Card 3: KiboCash (Moeda VIP)
    drawEconCard(570, 230, 230, 90, '🪙 KIBOCASH', userData.kiboCash, false);

    // 5. Bloco de Status do Personagem (Skills)
    const skills = typeof userData.skills === 'string' ? JSON.parse(userData.skills) : userData.skills;
    
    drawRoundRect(ctx, 50, 350, 750, 60, 10);
    ctx.fillStyle = '#11131a';
    ctx.fill();
    ctx.strokeStyle = '#22252c';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`📊 HABILIDADES:`, 70, 387);

    ctx.fillStyle = '#00FFCC'; // Neon Cyan
    ctx.shadowColor = '#00FFCC'; ctx.shadowBlur = 5;
    ctx.fillText(`🍀 Sorte: Nível ${skills.sorte || 1}`, 340, 387);
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#FF4444'; // Neon Red
    ctx.shadowColor = '#FF4444'; ctx.shadowBlur = 5;
    ctx.fillText(`🎭 Lábia: Nível ${skills.labia || 1}`, 560, 387);
    ctx.shadowBlur = 0;

    return canvas.toBuffer();
}