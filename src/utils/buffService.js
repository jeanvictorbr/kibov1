import { prisma } from '../core/database.js';

// Retorna os efeitos combinados dos buffs de item ativos do usuário
export async function getActiveBuffEffects(userId) {
    const buffs = await prisma.cooldown.findMany({ where: { userId } });
    const effects = { lucro: 0, sucesso: 0, lavagem: false, hackXp: false, transporte: false };

    for (const b of buffs) {
        if (b.expiresAt <= new Date()) continue;
        switch (b.command) {
            case 'buff_droga_leve': effects.lucro = Math.max(effects.lucro, 0.25); break;
            case 'buff_droga_pesada': effects.lucro = Math.max(effects.lucro, 0.50); break;
            case 'buff_arma_pistola': effects.sucesso = Math.max(effects.sucesso, 0.05); break;
            case 'buff_arma_fuzil': effects.sucesso = Math.max(effects.sucesso, 0.10); break;
            case 'buff_conta_limpa': effects.lavagem = true; break;
            case 'buff_script_hack': effects.hackXp = true; break;
            case 'buff_mapa_rotas': effects.transporte = true; break;
        }
    }
    return effects;
}

// Checa se o usuário tem um cooldown/status ativo
export async function hasActiveCooldown(userId, command) {
    const cd = await prisma.cooldown.findUnique({
        where: { userId_command: { userId, command } }
    });
    return !!cd && cd.expiresAt > new Date();
}
