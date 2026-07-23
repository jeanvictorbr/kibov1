import { prisma } from '../core/database.js';

// Configuração das 9 Moedas da Kibo Exchange
const COINS_CONFIG = [
    { coin: 'KBD', name: 'KiboDiamond', basePrice: 250000, volatility: 0.12 }, // A mais cara do jogo
    { coin: 'QTK', name: 'QuantumKibo', basePrice: 120000, volatility: 0.20 }, // Risco altíssimo para ricos
    { coin: 'KBG', name: 'KiboGold', basePrice: 85000, volatility: 0.08 },    // Investimento seguro (Ouro)
    { coin: 'BTK', name: 'BitKibo', basePrice: 45000, volatility: 0.15 },
    { coin: 'ETHK', name: 'EtherKibo', basePrice: 3200, volatility: 0.10 },
    { coin: 'KBC', name: 'KiboCoin', basePrice: 500, volatility: 0.05 },
    { coin: 'SOLK', name: 'SolanaKibo', basePrice: 150, volatility: 0.18 },
    { coin: 'DGK', name: 'DogeKibo', basePrice: 1.5, volatility: 0.35 },
    { coin: 'SHBK', name: 'ShibaKibo', basePrice: 0.05, volatility: 0.45 }
];

export async function getMarket() {
    const now = new Date();
    let market = await prisma.cryptoMarket.findMany();

    // 1. SISTEMA DE INJEÇÃO INTELIGENTE: Cria as moedas novas se não existirem
    for (const c of COINS_CONFIG) {
        const exists = market.find(m => m.coin === c.coin);
        if (!exists) {
            await prisma.cryptoMarket.create({
                data: { coin: c.coin, name: c.name, price: c.basePrice, lastPrice: c.basePrice, updatedAt: now }
            });
        }
    }
    
    market = await prisma.cryptoMarket.findMany();

    // 2. VERIFICAÇÃO DE TEMPO (10 MINUTOS)
    const lastUpdate = new Date(market[0].updatedAt);
    const minutesDiff = Math.abs(now - lastUpdate) / 60000;

    if (minutesDiff >= 10) {
        console.log('[KIBO EXCHANGE] ⏳ 10 Minutos passados! Atualizando cotação das criptomoedas...');
        
        for (const data of market) {
            const config = COINS_CONFIG.find(c => c.coin === data.coin);
            if (!config) continue;

            const change = 1 + (config.volatility * ((Math.random() * 2) - 1)); 
            let newPrice = data.price * change;

            if (newPrice < config.basePrice * 0.05) {
                newPrice = config.basePrice * 0.15; 
            }

            await prisma.cryptoMarket.update({
                where: { coin: data.coin },
                data: {
                    lastPrice: data.price,
                    price: newPrice,
                    updatedAt: now
                }
            });
        }
        market = await prisma.cryptoMarket.findMany();
    }

    return market;
}