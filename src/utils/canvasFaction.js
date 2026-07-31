import { createCanvas, loadImage } from 'canvas';
import { FACTION_ITEMS } from './factionItems.js';
import { xpToNext, readEstoque } from './factionService.js';

// Sem emojis no canvas: o Linux do servidor não tem fonte de emoji e renderiza
// quadradinhos. Tudo vira desenho limpo (estrela, triângulo, chip, círculos).

// Código de 2 letras por ramo pro emblema do cabeçalho
const RAMO_CODES = { trafico: 'TC', armas: 'AR', lavagem: 'LV', hack: 'HK', transporte: 'TP' };

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

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    let rot = -Math.PI / 2;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
        rot += step;
    }
    ctx.closePath();
    ctx.fill();
}

function drawAlertTriangle(ctx, cx, cy, s) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.lineTo(cx - s * 0.86, cy + s * 0.7);
    ctx.lineTo(cx + s * 0.86, cy + s * 0.7);
    ctx.closePath();
    ctx.fill();
}

// memberUsers: [{ user: DiscordUser, rank: 'lider'|'capo'|'membro' }] (líder primeiro)
// warInfo (opcional): { opponentName, opponentTag, pot, score }
export async function generateFactionCanvas(faction, config, leaderUser, memberUsers, warInfo) {
    const theme = config.themeColor || '#FF5555';
    const accent = config.accentColor || theme;

    // Altura dinâmica: com guerra ativa a faixa extra empurra o layout pra baixo
    const nextY = warInfo ? 220 : 160;
    const canvas = createCanvas(900, nextY + 595);
    const ctx = canvas.getContext('2d');

    // 1. FUNDO ESCURO + LINHAS DE DADOS + NÓS DE REDE
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 25) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 100, canvas.height); ctx.stroke();
    }

    const nodes = [[80, 80], [820, 90], [150, canvas.height - 60], [760, canvas.height - 100], [450, 420]];
    nodes.forEach(([nx, ny]) => {
        ctx.fillStyle = theme + '15';
        ctx.beginPath(); ctx.arc(nx, ny, 30, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = theme + '50';
        ctx.beginPath(); ctx.arc(nx, ny, 3, 0, Math.PI * 2); ctx.fill();
    });

    // 2. BARRA DE TOPO + BORDA NEON
    const topGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    topGrad.addColorStop(0, theme);
    topGrad.addColorStop(0.5, accent);
    topGrad.addColorStop(1, theme);
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, canvas.width, 8);

    ctx.lineWidth = 5;
    ctx.strokeStyle = theme;
    ctx.shadowColor = theme;
    ctx.shadowBlur = 18;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0;

    // 3. CABEÇALHO DA FACÇÃO
    // Emblema do ramo (chip com código em vez de emoji)
    const code = RAMO_CODES[faction.ramo] || 'FA';
    const emX = 40, emY = 44, emS = 46;
    drawRoundRect(ctx, emX, emY, emS, emS, 12);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fill();
    ctx.strokeStyle = theme; ctx.lineWidth = 2;
    ctx.shadowColor = theme; ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = theme;
    ctx.font = 'bold 18px Arial';
    const codeW = ctx.measureText(code).width;
    ctx.fillText(code, emX + (emS - codeW) / 2, emY + 30);

    ctx.fillStyle = theme;
    ctx.font = 'bold 20px Arial';
    ctx.shadowColor = theme; ctx.shadowBlur = 8;
    ctx.fillText('FACÇÃO', 108, 62);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    let nameFont = 44;
    ctx.font = `bold ${nameFont}px Arial`;
    while (ctx.measureText(faction.name.toUpperCase()).width > 500 && nameFont > 24) {
        nameFont -= 2;
        ctx.font = `bold ${nameFont}px Arial`;
    }
    ctx.shadowColor = theme; ctx.shadowBlur = 12;
    ctx.fillText(faction.name.toUpperCase(), 108, 112);
    ctx.shadowBlur = 0;

    // Tag badge no canto direito
    const tagTxt = `[${faction.tag}]`;
    ctx.font = 'bold 26px Arial';
    const tw = ctx.measureText(tagTxt).width;
    const bx = 790 - tw - 24, by = 44, bw = tw + 24, bh = 40;
    drawRoundRect(ctx, bx, by, bw, bh, 8);
    ctx.fillStyle = '#11131a';
    ctx.fill();
    ctx.strokeStyle = theme; ctx.lineWidth = 2;
    ctx.shadowColor = theme; ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = theme;
    ctx.fillText(tagTxt, bx + 12, by + 28);

    // Linha do ramo
    ctx.fillStyle = '#888899';
    ctx.font = 'italic 19px Arial';
    ctx.fillText(`RAMO: ${config.name}`, 108, 146);

    // 4. FAIXA DE GUERRA (opcional)
    if (warInfo) {
        drawRoundRect(ctx, 40, 168, 820, 34, 10);
        ctx.fillStyle = 'rgba(255, 60, 60, 0.12)';
        ctx.fill();
        ctx.strokeStyle = '#FF5555'; ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#FF5555';
        ctx.font = 'bold 17px Arial';
        drawAlertTriangle(ctx, 66, 185, 9);
        ctx.fillText(`EM GUERRA CONTRA ${warInfo.opponentName} [${warInfo.opponentTag}]  •  POTE $${warInfo.pot.toLocaleString('pt-BR')}  •  ${warInfo.score}`, 90, 192);
    }

    // 5. CARD DO LÍDER
    const lcY = nextY, lcH = 105;
    drawRoundRect(ctx, 40, lcY, 820, lcH, 14);
    ctx.fillStyle = '#11131a';
    ctx.fill();
    ctx.strokeStyle = '#22252c'; ctx.lineWidth = 2;
    ctx.stroke();

    try {
        const avatar = await loadImage(leaderUser.displayAvatarURL({ extension: 'png', size: 128 }));
        const r = 36, cx = 80, cy = lcY + 52;
        ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2, true);
        ctx.strokeStyle = theme; ctx.lineWidth = 3;
        ctx.shadowColor = theme; ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
    } catch (e) { console.error('Erro ao carregar avatar do líder no perfil de facção'); }

    // Estrela dourada do líder (no lugar da coroa emoji)
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 10;
    drawStar(ctx, 126, lcY + 26, 5, 11, 4.5);
    ctx.shadowBlur = 0;
    ctx.fillStyle = theme;
    ctx.font = 'bold 16px Arial';
    ctx.fillText('LÍDER', 148, lcY + 36);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Arial';
    ctx.fillText(leaderUser.globalName || leaderUser.username, 148, lcY + 72);
    ctx.fillStyle = '#888899';
    ctx.font = 'italic 16px Arial';
    ctx.fillText(`Comanda ${faction.members.length} criminoso(s) no submundo`, 148, lcY + 94);

    // 6. CARDS DE STATS
    const statsY = lcY + lcH + 14;
    const cardW = 190, cardH = 110, gap = 20, startX = 40;
    const cards = [
        { t: 'CAIXA', v: `$${faction.bank.toLocaleString('pt-BR')}` },
        { t: 'INFLUÊNCIA', v: `${faction.influencia}` },
        { t: 'NÍVEL', v: `${faction.nivel}` },
        { t: 'MEMBROS', v: `${faction.members.length}/20` }
    ];
    cards.forEach((c, i) => {
        const x = startX + i * (cardW + gap);
        drawRoundRect(ctx, x, statsY, cardW, cardH, 12);
        ctx.fillStyle = '#11131a';
        ctx.fill();
        ctx.strokeStyle = '#22252c'; ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = theme;
        ctx.font = 'bold 15px Arial';
        ctx.fillText(c.t, x + 15, statsY + 28);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 30px Arial';
        const vv = c.v.length > 14 ? c.v.slice(0, 13) + '…' : c.v;
        ctx.fillText(vv, x + 15, statsY + 78);
    });

    // 7. BARRA DE XP
    const xpY = statsY + cardH + 16;
    drawRoundRect(ctx, 40, xpY, 820, 54, 12);
    ctx.fillStyle = '#11131a';
    ctx.fill();
    ctx.strokeStyle = '#22252c'; ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`NÍVEL ${faction.nivel}`, 58, xpY + 34);
    const xpMax = xpToNext(faction.nivel);
    const pct = Math.min(1, faction.xp / xpMax);
    const barX = 190, barW = 560;
    drawRoundRect(ctx, barX, xpY + 14, barW, 26, 13);
    ctx.fillStyle = '#1b1e28';
    ctx.fill();
    if (pct > 0) {
        ctx.save();
        drawRoundRect(ctx, barX, xpY + 14, Math.max(14, barW * pct), 26, 13);
        ctx.clip();
        const g = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        g.addColorStop(0, theme);
        g.addColorStop(1, accent);
        ctx.fillStyle = g;
        ctx.fillRect(barX, xpY + 14, barW, 26);
        ctx.restore();
    }
    ctx.fillStyle = '#DDDDDD';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${faction.xp} / ${xpMax} XP`, 770, xpY + 33);

    // 8. ESTOQUE
    const estY = xpY + 70;
    drawRoundRect(ctx, 40, estY, 820, 150, 14);
    ctx.fillStyle = '#11131a';
    ctx.fill();
    ctx.strokeStyle = '#22252c'; ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = theme;
    ctx.font = 'bold 20px Arial';
    ctx.fillText('ESTOQUE', 58, estY + 34);

    const estoque = readEstoque(faction);
    const itens = Object.entries(estoque).filter(([, q]) => q > 0);
    if (itens.length === 0) {
        ctx.fillStyle = '#666666';
        ctx.font = 'italic 18px Arial';
        ctx.fillText('Vazio... Roda um k operacao que as mercadorias caem pra vocês.', 58, estY + 76);
    } else {
        ctx.font = 'bold 17px Arial';
        itens.slice(0, 8).forEach(([id, q], i) => {
            const col = i % 2 === 0 ? 0 : 1;
            const row = Math.floor(i / 2);
            const x = 58 + col * 380, y = estY + 74 + row * 34;
            const item = FACTION_ITEMS[id];
            // Bolinha decorativa no lugar do emoji do item
            ctx.fillStyle = accent;
            ctx.beginPath(); ctx.arc(x - 14, y - 6, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            const label = item ? `${item.name} × ${q}` : `${id} × ${q}`;
            ctx.fillText(label, x, y);
        });
    }

    // 9. MEMBROS (até 8 com avatar)
    const memY = estY + 166;
    drawRoundRect(ctx, 40, memY, 820, 120, 14);
    ctx.fillStyle = '#11131a';
    ctx.fill();
    ctx.strokeStyle = '#22252c'; ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = theme;
    ctx.font = 'bold 20px Arial';
    ctx.fillText('MEMBROS', 58, memY + 30);

    const maxShow = 8;
    const shown = memberUsers.slice(0, maxShow);
    const r2 = 26, startMemX = 64, step = 94;
    for (let i = 0; i < shown.length; i++) {
        const x = startMemX + i * step, cy = memY + 58;
        try {
            const av = await loadImage(shown[i].user.displayAvatarURL({ extension: 'png', size: 64 }));
            ctx.save();
            ctx.beginPath(); ctx.arc(x, cy, r2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(av, x - r2, cy - r2, r2 * 2, r2 * 2);
            ctx.restore();
        } catch (e) { /* sem avatar = círculo vazio */ }
        // Anel colorido indica o rank (sem emoji)
        const rank = shown[i].rank;
        ctx.beginPath(); ctx.arc(x, cy, r2 + 2, 0, Math.PI * 2, true);
        ctx.strokeStyle = rank === 'lider' ? '#FFD700' : (rank === 'capo' ? theme : '#3a3f4b');
        ctx.lineWidth = 3;
        ctx.stroke();
        if (rank === 'lider') {
            // Estrela dourada no canto do avatar do líder
            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 6;
            drawStar(ctx, x + r2 - 11, cy - r2 + 7, 5, 8, 3.4);
            ctx.shadowBlur = 0;
        } else if (rank === 'capo') {
            // Pontinho claro no canto do capo
            ctx.fillStyle = accent;
            ctx.beginPath(); ctx.arc(x + r2 - 8, cy - r2 + 8, 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#CCCCCC';
        ctx.font = 'bold 13px Arial';
        let nm = shown[i].user.username || '?';
        if (nm.length > 10) nm = nm.slice(0, 9) + '…';
        ctx.fillText(nm, x - r2, memY + 104);
    }
    if (memberUsers.length > maxShow) {
        ctx.fillStyle = accent;
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`+${memberUsers.length - maxShow}`, startMemX + maxShow * step + 6, memY + 60);
    }

    return canvas.toBuffer();
}
