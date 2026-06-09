import { createCanvas, loadImage, registerFont } from 'canvas';

export async function generateCdCanvas(user, statusList) {
    // 1. Configuração de tamanho (Dinâmico: altura aumenta conforme a lista)
    const itemHeight = 50; 
    const marginTop = 100;
    const marginBottom = 50;
    const canvasHeight = marginTop + (statusList.length * itemHeight) + marginBottom;
    const canvasWidth = 500;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Fundo
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Título
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('Cooldowns de Ações', 20, 50);

    // 2. Desenhar a lista
    statusList.forEach((item, index) => {
        const y = marginTop + (index * itemHeight);
        
        // Nome do comando
        ctx.fillStyle = '#cccccc';
        ctx.font = '20px Arial';
        ctx.fillText(item.command.toUpperCase(), 20, y);

        // Status (Disponível ou Tempo)
        if (item.status === 'active') {
            const now = new Date();
            const expires = new Date(item.expiresAt);
            const diff = Math.ceil((expires - now) / 60000); // minutos
            
            ctx.fillStyle = '#ff4d4d'; // Vermelho para ocupado
            ctx.fillText(`${diff} min`, 350, y);
        } else {
            ctx.fillStyle = '#4dff88'; // Verde para disponível
            ctx.fillText('Livre', 350, y);
        }
    });

    return canvas.toBuffer();
}