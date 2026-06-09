// src/modules/economia/commands/crash.js
import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createCanvas } from 'canvas';
import { prisma } from '../../../core/database.js';

async function drawCrash(mult, aposta) {
    const canvas = createCanvas(400, 250);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0b10'; ctx.fillRect(0, 0, 400, 250);
    ctx.fillStyle = '#00FF66'; ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${mult.toFixed(2)}x`, 200, 130);
    ctx.fillStyle = '#FFFFFF'; ctx.font = '20px Arial';
    ctx.fillText(`Aposta: $${aposta} | Lucro: $${(aposta * mult).toFixed(0)}`, 200, 180);
    return canvas.toBuffer();
}

export default {
    name: 'crash',
    execute: async (message, args) => {
        const aposta = parseFloat(args[0]);
        if (!aposta || aposta <= 0) return message.reply('**Diga o valor!**');

        await prisma.user.update({ where: { userId: message.author.id }, data: { balance: { decrement: aposta } } });

        let mult = 1.00;
        const crashPoint = (Math.random() * 4 + 1.2).toFixed(2);
        const msg = await message.reply({ files: [new AttachmentBuilder(await drawCrash(mult, aposta), { name: 'crash.png' })] });

        const interval = setInterval(async () => {
            mult += 0.15;
            
            // Verifica se o jogo ainda existe (se a mensagem foi editada por um Cashout)
            const currentMsg = await message.channel.messages.fetch(msg.id);
            if (currentMsg.components.length === 0) { // O botão sumiu = Cashout feito
                clearInterval(interval);
                return;
            }

            if (mult >= crashPoint) {
                clearInterval(interval);
                await msg.edit({ content: `# 💥 CRASH!\n**Explodiu em ${crashPoint}x. Você perdeu $${aposta}.**`, files: [], components: [] });
            } else {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`crash_stop_${message.author.id}_${aposta}_${mult.toFixed(2)}`).setLabel(`PARAR EM ${mult.toFixed(2)}x`).setStyle(ButtonStyle.Danger)
                );
                await msg.edit({ files: [new AttachmentBuilder(await drawCrash(mult, aposta), { name: 'crash.png' })], components: [row] }).catch(() => {});
            }
        }, 1000);
    }
};