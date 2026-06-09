import { createCanvas, registerFont } from 'canvas';

export async function generateReceipt(sender, target, amount) {
    const width = 450;
    const height = 650;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo Profissional
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, width, height);

    // Borda Neon Verde (Status Concluído)
    ctx.strokeStyle = '#00FF66';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Logomarca no Topo
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('KIBO BANK', width / 2, 60);
    
    ctx.fillStyle = '#00FF66';
    ctx.font = '14px Arial';
    ctx.fillText('SISTEMA FINANCEIRO PRIVADO', width / 2, 85);

    // Linha divisória
    ctx.strokeStyle = '#22252c';
    ctx.beginPath(); ctx.moveTo(50, 110); ctx.lineTo(width - 50, 110); ctx.stroke();

    // ID da Transação (Padrão KIBO)
    const genId = () => {
        const r = () => Math.random().toString(36).substring(2, 5).toUpperCase();
        return `KIBO-${r()}-${r()}`;
    };

    ctx.fillStyle = '#888899';
    ctx.font = '12px Arial';
    ctx.fillText('ID DA TRANSAÇÃO', width / 2, 140);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Courier New';
    ctx.fillText(genId(), width / 2, 165);

    // Detalhes da Transferência
    ctx.fillStyle = '#888899';
    ctx.font = '14px Arial';
    ctx.fillText('ENVIADO POR', 100, 220);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(sender.username, 100, 245);

    ctx.fillStyle = '#888899';
    ctx.fillText('DESTINATÁRIO', 350, 220);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(target.username, 350, 245);

    // Valor Central Neon
    ctx.fillStyle = '#00FF66';
    ctx.shadowColor = '#00FF66';
    ctx.shadowBlur = 15;
    ctx.font = 'bold 50px Arial';
    ctx.fillText(`$${amount.toLocaleString('pt-BR')}`, width / 2, 350);
    ctx.shadowBlur = 0;

    // Detalhes Finais
    const now = new Date();
    const data = now.toLocaleDateString('pt-BR');
    const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    ctx.fillStyle = '#888899';
    ctx.font = '14px Arial';
    ctx.fillText('DATA:', 120, 450);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(data, 120, 475);

    ctx.fillStyle = '#888899';
    ctx.fillText('HORÁRIO:', 330, 450);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(hora, 330, 475);

    // Footer de Segurança
    ctx.fillStyle = '#22252c';
    ctx.font = '10px Arial';
    ctx.fillText('COMPROVANTE EMITIDO AUTOMATICAMENTE PELO KIBO ENGINE.', width / 2, 620);

    return canvas.toBuffer();
}