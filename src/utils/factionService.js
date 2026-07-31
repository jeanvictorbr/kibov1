import { prisma } from '../core/database.js';

// Estado temporário de criação de facção (memória)
export const pendingCreation = new Map();

// Retorna a facção do usuário nessa cidade (ou null)
export async function getFactionOfUser(userId, guildId) {
    const member = await prisma.factionMember.findFirst({
        where: guildId ? { userId, guildId } : { userId },
        include: { faction: true }
    });
    return member?.faction ?? null;
}

// Retorna o registro de membro (com rank) ou null
export async function getMemberOfUser(userId, guildId) {
    return prisma.factionMember.findFirst({
        where: guildId ? { userId, guildId } : { userId }
    });
}

// Verifica se o user é Oficial da PM AGORA nesse servidor (o distintivo sozinho
// não conta: quem trocou de emprego no `k trabalhar` deixou a força)
export async function isPoliceOfficer(userId, guildId) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user || user.currentJob !== 'policial') return false;
    const badge = await prisma.policeBadge.findUnique({
        where: { userId_guildId: { userId, guildId } }
    });
    return !!badge;
}

// Bônus de nível da facção: +5% por nível
export function levelBonus(nivel) {
    return nivel * 0.05;
}

// XP necessário pro próximo nível
export function xpToNext(nivel) {
    return nivel * 500;
}

// Adiciona XP na facção e sobe o nível se precisar (cap 20)
export async function addFactionXp(factionId, amount) {
    const faction = await prisma.faction.findUnique({ where: { id: factionId } });
    let { xp, nivel } = faction;
    const maxNivel = 20;
    xp += amount;
    while (nivel < maxNivel && xp >= xpToNext(nivel)) {
        xp -= xpToNext(nivel);
        nivel += 1;
    }
    await prisma.faction.update({ where: { id: factionId }, data: { xp, nivel } });
}

// Gera uma tag única pra facção dentro do servidor
export async function generateTag(guildId, name) {
    const words = name.split(' ');
    let tag = words.map(w => w[0]).join('').toUpperCase().slice(0, 4);
    if (tag.length < 2) tag = name.toUpperCase().slice(0, 3);
    let base = tag;
    let n = 1;
    while (await prisma.faction.findFirst({ where: { guildId, tag } })) {
        tag = base + n;
        n++;
    }
    return tag;
}

// Lê o estoque da facção (JSON -> objeto)
export function readEstoque(faction) {
    return typeof faction.estoque === 'string' ? JSON.parse(faction.estoque) : (faction.estoque || {});
}

// Adiciona itens ao estoque da facção
export async function addToEstoque(factionId, itemId, qty) {
    const faction = await prisma.faction.findUnique({ where: { id: factionId } });
    const estoque = readEstoque(faction);
    estoque[itemId] = (estoque[itemId] || 0) + qty;
    await prisma.faction.update({ where: { id: factionId }, data: { estoque } });
}

// Remove itens do estoque da facção
export async function removeFromEstoque(factionId, itemId, qty) {
    const faction = await prisma.faction.findUnique({ where: { id: factionId } });
    const estoque = readEstoque(faction);
    const atual = estoque[itemId] || 0;
    if (atual <= qty) delete estoque[itemId];
    else estoque[itemId] = atual - qty;
    await prisma.faction.update({ where: { id: factionId }, data: { estoque } });
}

// ==========================================
// ⚔️ GUERRA DE FACÇÕES
// ==========================================

// Retorna a guerra em andamento (proposta ou ativa) que a facção participa
export async function getFactionActiveWar(factionId) {
    return prisma.factionWar.findFirst({
        where: {
            status: { in: ['proposta', 'ativo'] },
            OR: [{ factionAId: factionId }, { factionBId: factionId }]
        }
    });
}

// Retorna a guerra ativa entre duas facções (ou null)
export async function getWarBetween(factionAId, factionBId) {
    return prisma.factionWar.findFirst({
        where: {
            status: 'ativo',
            endsAt: { gt: new Date() },
            OR: [
                { factionAId, factionBId },
                { factionAId: factionBId, factionBId: factionAId }
            ]
        }
    });
}

// Resolve uma guerra que terminou (apostas + prêmios). Retorna o texto do resultado.
export async function settleWar(war) {
    if (!war || war.status === 'encerrada') return null;

    const [a, b] = await Promise.all([
        prisma.faction.findUnique({ where: { id: war.factionAId } }),
        prisma.faction.findUnique({ where: { id: war.factionBId } })
    ]);
    if (!a || !b) {
        await prisma.factionWar.update({ where: { id: war.id }, data: { status: 'encerrada' } });
        return null;
    }

    let winnerId = null;
    let resultMsg;

    if (war.pointsA === war.pointsB) {
        // 🤝 Empate: cada facção recupera sua aposta
        await prisma.$transaction([
            prisma.faction.update({ where: { id: war.factionAId }, data: { bank: { increment: war.bet } } }),
            prisma.faction.update({ where: { id: war.factionBId }, data: { bank: { increment: war.bet } } })
        ]);
        resultMsg = `🤝 **EMPATE NA GUERRA!**\n\nA guerra entre **${a.name}** [${a.tag}] e **${b.name}** [${b.tag}] terminou **${war.pointsA} a ${war.pointsB}**!\n\nNinguém levou o pote. Cada facção recuperou sua aposta de **$${war.bet.toLocaleString('pt-BR')}**.`;
    } else {
        // 🏆 Tem vencedor: leva o pote (as duas apostas) + XP e influência
        const aWon = war.pointsA > war.pointsB;
        winnerId = aWon ? war.factionAId : war.factionBId;
        const winner = aWon ? a : b;
        const loser = aWon ? b : a;
        const pot = war.bet * 2;
        const pontosVencedor = aWon ? war.pointsA : war.pointsB;
        const pontosPerdedor = aWon ? war.pointsB : war.pointsA;

        await prisma.$transaction([
            prisma.faction.update({ where: { id: winnerId }, data: { bank: { increment: pot }, xp: { increment: 100 }, influencia: { increment: 5 } } })
        ]);

        resultMsg = `🏆 **GUERRA ENCERRADA!**\n\n**${winner.name}** [${winner.tag}] venceu a guerra contra **${loser.name}** [${loser.tag}] por **${pontosVencedor} a ${pontosPerdedor}**!\n\n💰 Levou o pote de **$${pot.toLocaleString('pt-BR')}**, +100 XP e +5 de influência!\n\n*O respeito no morro agora tem dono!*`;
    }

    await prisma.factionWar.update({
        where: { id: war.id },
        data: { status: 'encerrada', winnerId, endedAt: new Date() }
    });

    return resultMsg;
}

// Resolve todas as guerras ativas já vencidas da guild (chamado no `k fac guerra`)
export async function settleExpiredWars(guildId) {
    const wars = await prisma.factionWar.findMany({
        where: { guildId, status: 'ativo', endsAt: { lte: new Date() } }
    });
    const results = [];
    for (const war of wars) {
        const msg = await settleWar(war);
        if (msg) results.push({ war, msg });
    }
    return results;
}

// Marca um ponto de guerra pra facção (chamado pelo k roubar)
export async function scoreWarPoint(robberFactionId, victimFactionId) {
    const war = await getWarBetween(robberFactionId, victimFactionId);
    if (!war) return null;
    const field = war.factionAId === robberFactionId ? 'pointsA' : 'pointsB';
    await prisma.factionWar.update({ where: { id: war.id }, data: { [field]: { increment: 1 } } });
    return war;
}
