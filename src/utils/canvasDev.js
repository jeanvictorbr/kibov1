import { createCanvas, loadImage } from 'canvas';
import os from 'os';

export async function generateDevDashboard(client, totalUsers, globalBalance, devUser) {
    const canvas = createCanvas(950, 600);
    const ctx = canvas.getContext('2d');

    // Fundo ultra moderno e limpo
    ctx.fillStyle = '#0b0c10';
    ctx.fillRect(0, 0, 950, 600);

    // Borda fina minimalista
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 950, 600);

    // Cabeçalho Principal
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('KIBO ENGINE CENTRAL MANAGEMENT', 50, 70);

    ctx.fillStyle = '#4f5d75';
    ctx.font = '14px Arial';
    ctx.fillText(`STATUS: ONLINE | HOST: DISCLOUD RUNTIME | NODE: ${process.version}`, 50, 100);

    // Renderizar Foto do Desenvolvedor (Canto Superior Direito)
    try {
        const avatarUrl = devUser.displayAvatarURL({ extension: 'png', size: 128 });
        const avatarImg = await loadImage(avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(850, 85, 45, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, 805, 40, 90, 90);
        ctx.restore();

        // Aro de luxo ao redor da foto
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(850, 85, 46, 0, Math.PI * 2, true);
        ctx.stroke();
    } catch (e) {
        console.error("Falha ao desenhar avatar do dev no Canvas:", e);
    }

    // Função de desenho de cards estruturados
    const drawModernCard = (x, y, w, h, title, val, sub) => {
        ctx.fillStyle = '#1f2229';
        ctx.fillRect(x, y, w, h);
        
        // Indicador lateral dourado chic
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x, y, 4, h);

        ctx.fillStyle = '#8d99ae';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(title, x + 20, y + 30);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(val, x + 20, y + 62);

        ctx.fillStyle = '#4f5d75';
        ctx.font = '11px Arial';
        ctx.fillText(sub, x + 20, y + 85);
    };

    const uptimeMin = Math.floor(client.uptime / 1000 / 60);
    const ramUsada = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

    // Grid de Informações
    drawModernCard(50, 150, 260, 110, 'UPTIME DO PROCESSO', `${uptimeMin} Minutos`, 'Tempo ininterrupto online');
    drawModernCard(340, 150, 260, 110, 'CONSUMO DE MEMÓRIA', `${ramUsada} MB`, 'Uso atual de heap RAM');
    drawModernCard(630, 150, 270, 110, 'PING DA API DISCORD', `${client.ws.ping}ms`, 'Tempo de resposta da API');

    drawModernCard(50, 290, 260, 110, 'CENÁRIOS CONECTADOS', `${client.guilds.cache.size} Guilds`, 'Servidores operando o bot');
    drawModernCard(340, 290, 260, 110, 'CONTAS NO BANCO', `${totalUsers} Contas`, 'Usuários únicos em cache');
    drawModernCard(630, 290, 270, 110, 'VOLUME FINANCEIRO', `$${globalBalance.toLocaleString()}`, 'Total de capital circulante');

    // Gráfico de Carga em Linha Clean
    ctx.fillStyle = '#13151a';
    ctx.fillRect(50, 430, 850, 120);
    ctx.strokeStyle = '#22252c';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 430, 850, 120);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 11px Arial';
    ctx.fillText('LIVE TRANSACTION MONITOR (PERFORMANCE GRÁFICA DA ENGINE)', 70, 455);

    // Linha do Gráfico Neon Clean
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let coords = [[70, 520], [180, 500], [300, 525], [420, 475], [550, 510], [680, 480], [800, 495], [880, 465]];
    ctx.moveTo(coords[0][0], coords[0][1]);
    for(let i=1; i<coords.length; i++) {
        ctx.lineTo(coords[i][0], coords[i][1]);
    }
    ctx.stroke();

    // Pequenas esferas nas dobras do gráfico
    ctx.fillStyle = '#FFFFFF';
    coords.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    return canvas.toBuffer();
}