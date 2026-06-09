import { createCanvas, loadImage } from 'canvas';

// 👑 COLOQUE AQUI O SEU ID DO DISCORD (Botão Direito no seu perfil -> Copiar ID)
const CEO_IDS = ['1070658145740926987']; 

// Função de segurança para desenhar cantos arredondados (Evita bugs no Linux)
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

export async function generateProfileCanvas(user, userDb) {
    const width = 850;
    const height = 480;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Identificação do Nível de Acesso
    const isCEO = CEO_IDS.includes(user.id);
    const isVip = userDb.isPremium;

    const themeColor = isCEO ? '#FFD700' : (isVip ? '#00FFFF' : '#00FF66');

    // 1. FUNDO PREMIUM COM PROFUNDIDADE
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    if (isCEO) {
        bgGradient.addColorStop(0, '#0a0803'); // Preto Dourado
        bgGradient.addColorStop(1, '#1a160d');
    } else {
        bgGradient.addColorStop(0, '#0a0b10'); // Preto Azulado
        bgGradient.addColorStop(1, '#161824');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Efeito de Brilho no Topo (Profundidade)
    const glow = ctx.createRadialGradient(width / 2, 0, 10, width / 2, 0, 400);
    glow.addColorStop(0, isCEO ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 255, 255, 0.03)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // 2. AVATAR DO JOGADOR COM SOMBRA 3D
    const avatarX = 110;
    const avatarY = 110;
    const radius = 65;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = '#22252c';
    ctx.fill();
    ctx.clip();

    try {
        const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 256 });
        const img = await loadImage(avatarUrl);
        ctx.drawImage(img, avatarX - radius, avatarY - radius, radius * 2, radius * 2);
    } catch (e) {
        console.error('Erro ao carregar avatar no perfil', e);
    }
    ctx.restore();

    // Borda do Avatar
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, radius, 0, Math.PI * 2, true);
    ctx.lineWidth = 6;
    ctx.strokeStyle = themeColor;
    ctx.stroke();

    // 3. INFORMAÇÕES PESSOAIS E CARGO (TAG)
    ctx.fillStyle = isCEO ? '#FFD700' : '#FFFFFF';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(user.username.toUpperCase(), 205, 95);

    // Desenhar a TAG do Cargo
    let roleText = '👤 MEMBRO PADRÃO';
    let roleBg = '#22252c';
    let roleTextColor = '#FFFFFF';

    if (isCEO) {
        roleText = '👑 CEO KIBO';
        roleBg = '#FFD700';
        roleTextColor = '#000000';
    } else if (isVip) {
        roleText = '💎 MEMBRO VIP';
        roleBg = '#00FFFF';
        roleTextColor = '#000000';
    }

    ctx.font = 'bold 18px Arial';
    const textWidth = ctx.measureText(roleText).width;
    
    // Fundo da TAG
    ctx.fillStyle = roleBg;
    drawRoundRect(ctx, 205, 115, textWidth + 30, 32, 16);
    ctx.fill();
    
    // Texto da TAG
    ctx.fillStyle = roleTextColor;
    ctx.fillText(roleText, 220, 137);

    // Linha Divisória Elegante
    ctx.strokeStyle = isCEO ? 'rgba(255, 215, 0, 0.3)' : '#22252c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 205);
    ctx.lineTo(805, 205);
    ctx.stroke();

    // 4. FUNÇÃO PARA DESENHAR AS CAIXAS (GLASSMORPHISM)
    const drawBox = (x, y, w, h, title, value, icon) => {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        
        ctx.fillStyle = '#11131a';
        drawRoundRect(ctx, x, y, w, h, 12);
        ctx.fill();
        ctx.restore();

        // Borda Interna
        ctx.strokeStyle = isCEO ? 'rgba(255, 215, 0, 0.5)' : '#1a1d26';
        ctx.lineWidth = 2;
        drawRoundRect(ctx, x, y, w, h, 12);
        ctx.stroke();

        ctx.fillStyle = '#888899';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${icon}  ${title}`, x + 20, y + 30);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 26px Courier New';
        ctx.fillText(value, x + 20, y + 65);
    };

    // 5. RENDIMENTOS FINANCEIROS (Linha do meio)
    const boxW = 230;
    const boxH = 90;
    const boxY = 235;

    drawBox(45, boxY, boxW, boxH, 'CARTEIRA', `$${(userDb.balance || 0).toLocaleString()}`, '💵');
    drawBox(310, boxY, boxW, boxH, 'BANCO', `$${(userDb.bank || 0).toLocaleString()}`, '🏦');
    drawBox(575, boxY, boxW, boxH, 'KIBO CASH', `${(userDb.kiboCash || userDb.KiboCash || 0).toLocaleString()} KC`, '🪙');

    // 6. PROFISSÃO E HABILIDADES (Linha de Baixo)
    const botBoxW = 362;
    const botBoxH = 80;
    const botBoxY = 355;

    // Processamento seguro das Skills
    const skills = typeof userDb.skills === 'string' ? JSON.parse(userDb.skills) : (userDb.skills || {});
    const sorteLvl = skills.sorte || 1;
    const labiaLvl = skills.labia || 1;
    
    let profissao = userDb.currentJob ? userDb.currentJob.toUpperCase() : 'DESEMPREGADO';
    
    // Caixa de Profissão
    drawBox(45, botBoxY, botBoxW, botBoxH, 'OCUPAÇÃO ATUAL', profissao, '💼');
    
    // Caixa de Habilidades
    drawBox(443, botBoxY, botBoxW, botBoxH, 'HABILIDADES DE RPG', `🍀 Lvl ${sorteLvl}   |   🗣️ Lvl ${labiaLvl}`, '🧠');

    return canvas.toBuffer();
}