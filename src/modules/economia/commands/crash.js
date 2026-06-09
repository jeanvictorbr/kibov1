// src/modules/economia/commands/crash.js
import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createCanvas } from 'canvas';

async function drawCrash(mult, aposta) {
    const canvas = createCanvas(500, 300);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0b10'; ctx.fillRect(0, 0, 500, 300);
    
    // Foguetinho (Texto estilo gráfico)
    ctx.fillStyle = '#00FF66';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${mult.toFixed(2)}x`, 250, 150);
    
    // Lucro Atual
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Lucro: $ ${(aposta * mult).toFixed(0)}`, 250, 200);
    
    return canvas.toBuffer();
}

export default {
    name: 'crash',
    execute: async (message, args) => {
        const aposta = parseFloat(args[0]);
        if (!aposta) return message.reply('Manda o valor da aposta!');

        let mult = 1.0;
        let rodando = true;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`crash_stop_${message.author.id}_${aposta}`).setLabel('PARAR').setStyle(ButtonStyle.Danger)
        );

        const msg = await message.reply({ files: [new AttachmentBuilder(await drawCrash(mult, aposta))], components: [row] });

        const interval = setInterval(async () => {
            if (!rodando) return clearInterval(interval);
            mult += 0.15;
            await msg.edit({ files: [new AttachmentBuilder(await drawCrash(mult, aposta))] }).catch(() => {});
            if (mult > 5.0) { rodando = false; msg.edit({ content: '💥 Crashou!', components: [] }); clearInterval(interval); }
        }, 1000);
    }
};