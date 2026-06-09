import { prisma } from '../core/database.js';

export async function checkCooldown(userId, command) {
    const cd = await prisma.cooldown.findUnique({ where: { userId_command: { userId, command } } });
    if (cd && new Date() < cd.expiresAt) return cd.expiresAt;
    return null;
}

export async function setCooldown(userId, command, hours) {
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    await prisma.cooldown.upsert({
        where: { userId_command: { userId, command } },
        update: { expiresAt },
        create: { userId, command, expiresAt }
    });
}