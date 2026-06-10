import { createCanvas, loadImage } from 'canvas';

export async function generateAirdropCanvas(host, amount, status = 'OPEN', participants = 0, splitAmount = 0) {
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo Premium
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0a0b10');
    gradient.addColorStop(1, '#161824');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Efeito de Brilho Central (Ouro se tiver aberto/fechado, Vermelho se cancelado)
    const glow = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, 400);
    glow.addColorStop(0, status === 'CANCELED' ? 'rgba(255, 68, 68, 0.15)' : 'rgba(255, 215, 0, 0.15)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Borda da Imagem
    ctx.strokeStyle = status === 'CANCELED' ? '#FF4444' : '#FFD700';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, width, height);

    // Avatar do Magnata Host
    const avatarSize = 100;
    const avatarX = width / 2 - avatarSize / 2;
    const avatarY = 40;

    try {
        const avatarUrl = host.displayAvatarURL({ extension: 'png', size: 128 });
        const avatar = await loadImage(avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // Borda do Avatar
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
        ctx.strokeStyle = status === 'CANCELED' ? '#FF4444' : '#FFD700';
        ctx.lineWidth = 4;
        ctx.stroke();
    } catch (e) {
        console.error("Erro ao desenhar avatar no Airdrop");
    }

    // Textos Principais
    ctx.textAlign = 'center';
    ctx.fillStyle = status === 'CANCELED' ? '#FF4444' : '#FFD700';
    ctx.font = 'bold 36px Arial';
    
    let title = '🌧️ CHUVA DE PIX 🌧️';
    if (status === 'CLOSED') title = '🌧️ AIRDROP FINALIZADO 🌧️';
    if (status === 'CANCELED') title = '❌ AIRDROP CANCELADO ❌';
    ctx.fillText(title, width / 2, 190);

    // O Valor Gigante
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 55px Arial';
    ctx.fillText(`$${amount.toLocaleString('pt-BR')}`, width / 2, 255);

    // Textos do Rodapé dependendo do Status do Airdrop
    ctx.fillStyle = '#888899';
    ctx.font = '22px Arial';
    if (status === 'OPEN') {
        ctx.fillText(`Patrocinado por: ${host.username}`, width / 2, 295);
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('⏳ Faltam 60 segundos para fechar!', width / 2, 345);
    } else if (status === 'CLOSED') {
        ctx.fillText(`${participants} jogadores clicaram e apanharam a grana!`, width / 2, 300);
        ctx.fillStyle = '#00FF66';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`Ganho: $${splitAmount.toLocaleString('pt-BR')} cada.`, width / 2, 340);
    } else {
        ctx.fillText('Ninguém clicou a tempo. O dinheiro foi devolvido.', width / 2, 300);
    }

    return canvas.toBuffer();
}