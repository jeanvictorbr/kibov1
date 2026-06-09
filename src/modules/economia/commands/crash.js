import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createCanvas } from 'canvas';
import { prisma } from '../../../core/database.js';
import { parseAmount } from '../../../utils/parser.js'; // Importando o conversor universal

async function drawCrash(mult, aposta) {
    const canvas = createCanvas(400, 250);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0b10'; ctx.fillRect(0, 0, 400, 250);
    ctx.fillStyle = '#00FF66'; ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${mult.toFixed(2)}x`, 200, 130);
    ctx.fillStyle = '#FFFFFF'; ctx.font = '20px Arial';
    ctx.fillText(`Aposta: $${aposta.toLocaleString('pt-BR')} | Potencial: $${(aposta * mult).toFixed(0)}`, 200, 180);
    return canvas.toBuffer();
}

export default {
    name: 'crash',
    execute: async (message, args) => {
        // 1. Busca o usuário no banco e garante que ele existe
        const user = await prisma.user.upsert({
            where: { userId: message.author.id },
            update: {},
            create: { userId: message.author.id }
        });

        // 2. Lê a aposta usando o nosso conversor inteligente
        let aposta = parseAmount(args[0]);

        if (aposta === 'ALL') {
            aposta = user.balance; // Se usar "tudo", aposta a carteira inteira
        }

        if (!aposta || isNaN(aposta) || aposta <= 0) {
            return message.reply('**Diga o valor da aposta, chefe!**\nEx: `k crash 10k` ou `k crash tudo`');
        }

        // 3. A TRAVA DE SEGURANÇA IMPETrÁVEL
        if (user.balance < aposta) {
            return message.reply(`❌ **Tentativa de fraude bloqueada!**\nVocê só tem **$${user.balance.toLocaleString('pt-BR')}** na sua carteira.`);
        }

        // 4. Debita da carteira APENAS DEPOIS da verificação
        await prisma.user.update({ 
            where: { userId: message.author.id }, 
            data: { balance: { decrement: aposta } } 
        });

        let mult = 1.00;
        const crashPoint = (Math.random() * 4 + 1.2).toFixed(2);
        
        // Botão inicial
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`crash_stop_${message.author.id}_${aposta}_${mult.toFixed(2)}`).setLabel(`PARAR EM ${mult.toFixed(2)}x`).setStyle(ButtonStyle.Danger)
        );

        const msg = await message.reply({ 
            files: [new AttachmentBuilder(await drawCrash(mult, aposta), { name: 'crash.png' })], 
            components: [row] 
        });

        const interval = setInterval(async () => {
            mult += 0.20;
            const currentMsg = await message.channel.messages.fetch(msg.id).catch(() => null);
            
            // Se a mensagem sumiu ou o botão sumiu, alguém parou o jogo
            if (!currentMsg || currentMsg.components.length === 0) return clearInterval(interval);

            if (mult >= parseFloat(crashPoint)) {
                clearInterval(interval);
                await msg.edit({ content: `# 💥 CRASH!\n**Explodiu em ${crashPoint}x. Você perdeu $${aposta.toLocaleString('pt-BR')}.**`, files: [], components: [] }).catch(() => {});
            } else {
                const newRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`crash_stop_${message.author.id}_${aposta}_${mult.toFixed(2)}`).setLabel(`PARAR EM ${mult.toFixed(2)}x`).setStyle(ButtonStyle.Danger)
                );
                await msg.edit({ files: [new AttachmentBuilder(await drawCrash(mult, aposta), { name: 'crash.png' })], components: [newRow] }).catch(() => {});
            }
        }, 1000);
    }
};