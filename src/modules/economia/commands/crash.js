// src/modules/economia/commands/crash.js
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { createCanvas } from 'canvas';

async function generateCrashCanvas(mult) {
    const canvas = createCanvas(400, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0b10'; ctx.fillRect(0, 0, 400, 200);
    ctx.fillStyle = '#00FF66'; ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${mult.toFixed(2)}x`, 200, 120);
    return canvas.toBuffer();
}

export default {
    name: 'crash',
    execute: async (message, args, client, reply) => {
        const amount = args.find(arg => typeof arg === 'number');
        if (!amount) return message.reply('**Diga o valor da aposta!**');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`crash_cashout_${message.author.id}_${amount}`).setLabel('PARAR').setStyle(ButtonStyle.Danger)
        );

        let mult = 1.00;
        const crashPoint = (Math.random() * (4.0 - 1.2) + 1.2).toFixed(2);
        
        const buffer = await generateCrashCanvas(mult);
        const msg = await message.reply({ files: [new AttachmentBuilder(buffer, { name: 'crash.png' })], components: [row] });

        const interval = setInterval(async () => {
            mult += 0.20;
            if (mult >= crashPoint) {
                clearInterval(interval);
                await msg.edit({ content: `💥 **CRASHOU EM ${crashPoint}x!**`, files: [], components: [] });
            } else {
                const newBuffer = await generateCrashCanvas(mult);
                await msg.edit({ files: [new AttachmentBuilder(newBuffer, { name: 'crash.png' })] }).catch(() => {});
            }
        }, 1500);
    }
};