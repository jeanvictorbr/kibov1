// Itens exclusivos produzidos por cada ramo de facção
export const FACTION_ITEMS = {
    droga_leve: {
        emoji: '🌿',
        name: 'Maconha Kibo',
        tipo: 'droga',
        desc: 'Fumaça boa. +25% de lucro em trabalhos e operações por 10 minutos.',
        buffCooldown: 'buff_droga_leve',
        buffMin: 10,
        effect: { lucro: 0.25 },
        precoBase: 15000
    },
    droga_pesada: {
        emoji: '💉',
        name: 'Pó Kibo',
        tipo: 'droga',
        desc: 'Pó refinado da quebrada. +50% de lucro em trabalhos e operações por 10 minutos.',
        buffCooldown: 'buff_droga_pesada',
        buffMin: 10,
        effect: { lucro: 0.50 },
        precoBase: 40000
    },
    arma_pistola: {
        emoji: '🔫',
        name: 'Pistola .40',
        tipo: 'arma',
        desc: 'Porte ilegal. +5% de chance de sucesso em assaltos por 15 minutos.',
        buffCooldown: 'buff_arma_pistola',
        buffMin: 15,
        effect: { sucesso: 0.05 },
        precoBase: 50000
    },
    arma_fuzil: {
        emoji: '💥',
        name: 'Fuzil AK Kibo',
        tipo: 'arma',
        desc: 'Peso pesado. +10% de chance de sucesso em assaltos por 15 minutos.',
        buffCooldown: 'buff_arma_fuzil',
        buffMin: 15,
        effect: { sucesso: 0.10 },
        precoBase: 120000
    },
    conta_limpa: {
        emoji: '💳',
        name: 'Conta de Lavagem',
        tipo: 'servico',
        desc: 'Nota lavada sob medida. Taxa da lavanderia cortada pela metade por 15 minutos.',
        buffCooldown: 'buff_conta_limpa',
        buffMin: 15,
        effect: { lavagem: true },
        precoBase: 20000
    },
    script_hack: {
        emoji: '🕹️',
        name: 'Script de Invasão',
        tipo: 'servico',
        desc: 'Código que quebra firewalls. +50% de XP pra facção em operações por 15 minutos.',
        buffCooldown: 'buff_script_hack',
        buffMin: 15,
        effect: { hackXp: true },
        precoBase: 30000
    },
    mapa_rotas: {
        emoji: '🗺️',
        name: 'Mapa de Rotas',
        tipo: 'servico',
        desc: 'Atalhos entre distritos. +2 de influência por operação por 15 minutos.',
        buffCooldown: 'buff_mapa_rotas',
        buffMin: 15,
        effect: { transporte: true },
        precoBase: 25000
    }
};

// Item (ou roleta de itens) que cada ramo produz; a chance do pesado sobe com o nível
export function rollProduction(ramo, nivel) {
    const chancesPesado = Math.min(0.6, 0.2 + nivel * 0.04); // 20% -> 60% com o nível
    switch (ramo) {
        case 'trafico':
            return Math.random() < chancesPesado ? 'droga_pesada' : 'droga_leve';
        case 'armas':
            return Math.random() < chancesPesado ? 'arma_fuzil' : 'arma_pistola';
        case 'lavagem':
            return 'conta_limpa';
        case 'hack':
            return 'script_hack';
        case 'transporte':
            return 'mapa_rotas';
        default:
            return null;
    }
}

export function getItemByName(name) {
    return Object.values(FACTION_ITEMS).find(i => i.name === name) || null;
}
