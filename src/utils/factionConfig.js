// Configuração dos ramos de facção
export const FACTIONS = {
    trafico: {
        emoji: '💊',
        name: 'Tráfico de Drogas',
        desc: 'Plantio e revenda de droga. Produz itens que dão buffs (em breve). Buff passivo: +10% de lucro na operação.',
        opMin: 4000,
        opMax: 9000,
        risco: 25,
        buff: 'op_lucro',
        themeColor: '#00C853',
        accentColor: '#00E676'
    },
    armas: {
        emoji: '🔫',
        name: 'Contrabando de Armas',
        desc: 'Fabrica e vende armamento pesado. Buff passivo: -30% de risco na operação e +chance de sucesso em roubos.',
        opMin: 5000,
        opMax: 10000,
        risco: 30,
        buff: 'op_risco',
        themeColor: '#FF5722',
        accentColor: '#FF8A50'
    },
    lavagem: {
        emoji: '💵',
        name: 'Lavagem de Dinheiro',
        desc: 'Lava a grana suja da cidade. Buff passivo: +15% do lucro vai pro caixa da facção.',
        opMin: 3000,
        opMax: 7000,
        risco: 15,
        buff: 'op_banco',
        themeColor: '#00E5FF',
        accentColor: '#80FFFF'
    },
    hack: {
        emoji: '💻',
        name: 'Hacking',
        desc: 'Invade sistemas e queima servidores. Buff passivo: -15% de cooldown na operação.',
        opMin: 6000,
        opMax: 11000,
        risco: 35,
        buff: 'op_cooldown',
        themeColor: '#7B68EE',
        accentColor: '#B09FFF'
    },
    transporte: {
        emoji: '🚚',
        name: 'Transporte de Contrabando',
        desc: 'Corre com carga pesada entre distritos. Buff passivo: +100% de XP pra facção na operação.',
        opMin: 2000,
        opMax: 5000,
        risco: 10,
        buff: 'op_xp',
        themeColor: '#FFB300',
        accentColor: '#FFD54F'
    }
};

export const FACTIONS_ORDER = ['trafico', 'armas', 'lavagem', 'hack', 'transporte'];
