import { prisma } from '../core/database.js';
import { setCooldown, checkCooldown } from './cooldownManager.js';

export async function processInteraction(message, target, actionData) {
    const userId = message.author.id;

    // 1. Cooldown de 30 minutos (0.5 horas)
    const cd = await checkCooldown(userId, `int_${actionData.name}`);
    if (cd) {
        const min = Math.ceil((cd - new Date()) / 60000);
        return message.reply(`⏳ **Calma!** Você ainda precisa descansar ${min} minutos antes de usar ${actionData.name} novamente.`);
    }

    // 2. Chance de falha (20%)
    if (Math.random() < 0.20) {
        return message.channel.send(`❌ **${target.username}** esquivou do seu ataque! Que vergonha...`);
    }

    // 3. Recompensa (VIP ganha 2x)
    const userDb = await prisma.user.findUnique({ where: { userId } });
    let ganho = Math.floor(Math.random() * 300) + 100;
    if (userDb?.isPremium) ganho *= 2;

    await prisma.user.update({ where: { userId }, data: { balance: { increment: ganho } } });
    await setCooldown(userId, `int_${actionData.name}`, 0.5);

    // 4. Mensagem e GIF
    const msg = actionData.msgs[Math.floor(Math.random() * actionData.msgs.length)];
    const gif = actionData.gifs[Math.floor(Math.random() * actionData.gifs.length)];

    await message.channel.send({
        content: `${msg} **${target.username}** foi atingido! Ganho: **$${ganho.toLocaleString()}** ↗`,
        files: [gif]
    });
}