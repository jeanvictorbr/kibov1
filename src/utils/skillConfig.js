// Configuração central da Árvore de Habilidades
export const SKILLS = {
    sorte: {
        emoji: '🍀',
        name: 'Sorte',
        desc: 'Aumenta em +5% os lucros em trabalhos e roubos por nível.',
        max: 10,
        cost: 50000,
        style: 'Success'
    },
    labia: {
        emoji: '🗣️',
        name: 'Lábia',
        desc: 'Reduz em 5% o valor das multas quando a polícia te pega por nível.',
        max: 10,
        cost: 50000,
        style: 'Primary'
    },
    agilidade: {
        emoji: '💨',
        name: 'Agilidade',
        desc: 'Reduz em 4% o cooldown de trabalhos e assaltos por nível.',
        max: 10,
        cost: 50000,
        style: 'Secondary'
    },
    inteligencia: {
        emoji: '🧠',
        name: 'Inteligência',
        desc: 'Aumenta em +7% os lucros do trabalho de Hacker por nível.',
        max: 10,
        cost: 50000,
        style: 'Primary'
    },
    forca: {
        emoji: '💪',
        name: 'Força',
        desc: 'Aumenta em +7% o valor roubado nos assaltos por nível.',
        max: 10,
        cost: 50000,
        style: 'Danger'
    },
    intimidacao: {
        emoji: '🕵️',
        name: 'Intimidação',
        desc: 'Aumenta em +2% a chance de sucesso em assaltos por nível.',
        max: 10,
        cost: 50000,
        style: 'Success'
    }
};

export const SKILL_ORDER = ['sorte', 'labia', 'agilidade', 'inteligencia', 'forca', 'intimidacao'];

// Normaliza o campo JSON de skills (vem do banco como string ou objeto)
export function parseSkills(skillsRaw) {
    return typeof skillsRaw === 'string' ? JSON.parse(skillsRaw) : (skillsRaw || {});
}

export function getSkillLevel(skills, key) {
    return skills[key] || 1;
}

// Custo DOBRA a cada nível
export function getSkillCost(key, level) {
    const base = SKILLS[key]?.cost ?? 50000;
    return base * Math.pow(2, level - 1);
}
