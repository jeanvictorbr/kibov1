export function parseAmount(input) {
    if (!input) return 0;
    const str = input.toLowerCase();
    
    if (str.endsWith('m')) return parseFloat(str) * 1000000;
    if (str.endsWith('b') || str.endsWith('bilhao')) return parseFloat(str) * 1000000000;
    if (str.endsWith('t') && !str.includes('tudo') && !str.includes('trilhao')) return parseFloat(str) * 1000000000000; // Ex: 1t (trilhão)
    if (str.endsWith('trilhao')) return parseFloat(str) * 1000000000000;
    if (str.endsWith('q') || str.endsWith('quadrilhao')) return parseFloat(str) * 1000000000000000; // Quadrilhão
    if (str === 'tudo' || str === 'all' || str === 't') return 'ALL'; // Aceita apenas 't' como tudo
    
    return parseFloat(str) || 0;
}