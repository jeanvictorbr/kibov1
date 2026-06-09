import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    name: 'crash',
    execute: async (message, args, client, reply) => {
        const amount = args.find(arg => typeof arg === 'number');
        if (!amount) return message.reply('# 🎰 APOSTA MÍNIMA\n**Diga quanto quer apostar, chefe!** Ex: `k crash 100`');

        // Cria o botão de "Parar" (Cashout)
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`crash_cashout_${message.author.id}_${amount}`)
                .setLabel('PARAR AGORA (Cashout)')
                .setStyle(ButtonStyle.Danger)
        );

        const msg = await message.reply({
            content: `# 🚀 O FOGUETE DECOLOU!\n**Multiplicador: 1.00x**\n*Aposte para ganhar bilhões!*`,
            components: [row]
        });

        // Lógica do jogo (Loop de subida do multiplicador)
        let mult = 1.00;
        const crashPoint = (Math.random() * (5.0 - 1.1) + 1.1).toFixed(2); // O foguete explode entre 1.1x e 5x
        let gameOver = false;

        const interval = setInterval(async () => {
            if (gameOver) return clearInterval(interval);
            mult += 0.15;
            
            if (mult >= crashPoint) {
                gameOver = true;
                clearInterval(interval);
                await msg.edit({ content: `# 💥 CRASH!\n**O foguete explodiu em ${crashPoint}x!**\nQuem não parou, perdeu tudo.`, components: [] });
            } else {
                await msg.edit({ content: `# 🚀 O FOGUETE DECOLOU!\n**Multiplicador: ${mult.toFixed(2)}x**`, components: [row] }).catch(() => {});
            }
        }, 1000);
    }
};