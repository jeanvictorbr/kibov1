import { prisma } from '../core/database.js';

// Configuração das 6 Moedas da Kibo Exchange
const COINS_CONFIG = [
    { coin: 'BTK', name: 'BitKibo', basePrice: 45000, volatility: 0.15 },  // Pode subir/cair até 15% por hora
    { coin: 'ETHK', name: 'EtherKibo', basePrice: 3200, volatility: 0.10 },
    { coin: 'KBC', name: 'KiboCoin', basePrice: 500, volatility: 0.05 },   // Mais estável (5%)
    { coin: 'SOLK', name: 'SolanaKibo', basePrice: 150, volatility: 0.18 }, // Agressiva
    { coin: 'DGK', name: 'DogeKibo', basePrice: 1.5, volatility: 0.35 },   // Moeda Meme (35% de risco)
    { coin: 'SHBK', name: 'ShibaKibo', basePrice: 0.05, volatility: 0.45 } // Super Meme Loteria
];

export async function getMarket() {
    const now = new Date();
    let market = await prisma.cryptoMarket.findMany();

    // 1. PRIMEIRA INICIALIZAÇÃO: Se o mercado estiver vazio, cria as moedas
    if (market.length === 0) {
        for (const c of COINS_CONFIG) {
            await prisma.cryptoMarket.create({
                data: { coin: c.coin, name: c.name, price: c.basePrice, lastPrice: c.basePrice, updatedAt: now }
            });
        }
        return await prisma.cryptoMarket.findMany();
    }

    // 2. VERIFICAÇÃO DE TEMPO (1 HORA REAL)
    const lastUpdate = new Date(market[0].updatedAt);
    const hoursDiff = Math.abs(now - lastUpdate) / 36e5; // Converte milissegundos em horas

    if (hoursDiff >= 1) {
        console.log('[KIBO EXCHANGE] ⏳ Virada de hora! Atualizando cotação das criptomoedas...');
        
        // Atualiza o preço de todas as 6 moedas
        for (const data of market) {
            const config = COINS_CONFIG.find(c => c.coin === data.coin);
            if (!config) continue;

            // Matemática do Crash/Pump: Gera um multiplicador entre -volatility e +volatility
            const change = 1 + (config.volatility * ((Math.random() * 2) - 1)); 
            let newPrice = data.price * change;

            // Trava de segurança Anti-Falência: O preço nunca zera
            // Se cair abaixo de 5% do valor base, as "baleias" compram e o preço dá um rebote pra cima.
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
        // Puxa o mercado atualizado do banco de dados
        market = await prisma.cryptoMarket.findMany();
    }

    return market;
}