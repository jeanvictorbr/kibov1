import { createCanvas } from 'canvas';
import os from 'os';

export async function generateDevDashboard(client, totalUsers, globalBalance) {
    const canvas = createCanvas(900, 550);
    const ctx = canvas.getContext('2d');

    // 1. Fundo Espacial Premium
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, 900, 550);

    // Grelha de Fundo Futurista (Grid Lines)
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 900; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 550); ctx.stroke();
    }
    for (let j = 0; j < 550; j += 40) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(900, j); ctx.stroke();
    }

    // Moldura Externa Dourada
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, 900, 550);

    // 2. Cabeçalho Principal
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('KIBO ENGINE • DEVELOPER DASHBOARD', 45, 60);

    ctx.fillStyle = '#666677';
    ctx.font = '14px Arial';
    ctx.fillText(`ID DO PROCESSO: #${process.pid} | PLATAFORMA: ${os.platform().toUpperCase()}`, 45, 85);

    // 3. Renderização de "Cards" de Monitorização
    const drawCard = (x, y, w, h, title, value, subtext, color = '#12121f') => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(title, x + 20, y + 30);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(value, x + 20, y + 65);

        ctx.fillStyle = '#888899';
        ctx.font = '12px Arial';
        ctx.fillText(subtext, x + 20, y + 95);
    };

    // Linha 1 de Cards (Métricas do Bot)
    const uptime = Math.floor(client.uptime / 1000 / 60); // em minutos
    const ramUsada = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    drawCard(45, 120, 250, 120, 'SISTEMA OPERACIONAL', `${uptime} min`, 'Tempo Total de Uptime');
    drawCard(320, 120, 250, 120, 'PERFORMANCE HARDWARE', `${ramUsada} MB`, `RAM Alocada na Discloud`);
    drawCard(595, 120, 260, 120, 'LATÊNCIA DA API', `${client.ws.ping}ms`, 'Ping do WebSocket Discord');

    // Linha 2 de Cards (Métricas da Base de Dados)
    drawCard(45, 265, 250, 120, 'GUILDS ATIVAS', `${client.guilds.cache.size}`, 'Servidores Conectados');
    drawCard(320, 265, 250, 120, 'USUÁRIOS REGISTADOS', `${totalUsers}`, 'Contas no PostgreSQL');
    drawCard(595, 265, 260, 120, 'ECONOMIA GLOBAL', `$${globalBalance.toLocaleString()}`, 'Volume Total Emitido');

    // 4. Painel Inferior: Gráfico Analítico de Carga da Engine
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(45, 410, 810, 100);
    ctx.strokeStyle = '#333344';
    ctx.strokeRect(45, 410, 810, 100);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('FLUXO DE TRANSAÇÕES EM TEMPO REAL (ENGINE GRAPH)', 65, 435);

    // Desenhar Linha Simulação de Gráfico de Linha (Estilo Alta Performance)
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(65, 490);
    ctx.lineTo(150, 470);
    ctx.lineTo(250, 485);
    ctx.lineTo(380, 445);
    ctx.lineTo(500, 475);
    ctx.lineTo(620, 450);
    ctx.lineTo(720, 465);
    ctx.lineTo(825, 440);
    ctx.stroke();

    // Pontos do Gráfico
    ctx.fillStyle = '#FFFFFF';
    const pontos = [[65, 490], [150, 470], [250, 485], [380, 445], [500, 475], [620, 450], [720, 465], [825, 440]];
    pontos.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    return canvas.toBuffer();
}