import { createCanvas } from 'canvas';

export async function generateLojaCanvas(items) {
    const canvas = createCanvas(600, 200 + (items.length * 60));
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('🛒 LOJA KIBO', 30, 50);

    items.forEach((item, index) => {
        const y = 100 + (index * 60);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Courier New';
        ctx.fillText(item.name, 30, y);
        
        ctx.fillStyle = '#00FF66';
        ctx.fillText(`$${item.price.toLocaleString()}`, 450, y);
        
        ctx.fillStyle = '#888899';
        ctx.font = '14px Arial';
        ctx.fillText(item.description, 30, y + 25);
    });

    return canvas.toBuffer();
}