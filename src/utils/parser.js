export function parseAmount(input) {
    if (!input) return 0;
    const str = input.toLowerCase();
    
    if (str.endsWith('m')) return parseFloat(str) * 1000000;
    if (str.endsWith('b') || str.endsWith('bilhao')) return parseFloat(str) * 1000000000;
    if (str.endsWith('t') || str.endsWith('trilhao')) return parseFloat(str) * 1000000000000;
    if (str === 'tudo' || str === 'all') return 'ALL';
    
    return parseFloat(str) || 0;
}