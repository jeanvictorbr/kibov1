export function parseAmount(input) {
    if (!input) return 0;
    
    // Converte para string com segurança antes de usar toLowerCase
    const str = input.toString().toLowerCase().trim();

    // Lógica de "Tudo"
    if (['tudo', 'all', 't'].includes(str)) return 'ALL';

    // Conversão de letras para números
    let multiplier = 1;
    let cleanStr = str;

    if (str.endsWith('kk')) { multiplier = 1000000; cleanStr = str.replace('kk', ''); }
    else if (str.endsWith('k')) { multiplier = 1000; cleanStr = str.replace('k', ''); }
    else if (str.endsWith('m')) { multiplier = 1000000; cleanStr = str.replace('m', ''); }
    else if (str.endsWith('b') || str.endsWith('bilhao')) { multiplier = 1000000000; cleanStr = str.replace(/b|bilhao/, ''); }
    else if (str.endsWith('t') || str.endsWith('trilhao')) { multiplier = 1000000000000; cleanStr = str.replace(/t|trilhao/, ''); }
    else if (str.endsWith('q') || str.endsWith('quadrilhao')) { multiplier = 1000000000000000; cleanStr = str.replace(/q|quadrilhao/, ''); }

    const value = parseFloat(cleanStr);
    return isNaN(value) ? 0 : Math.floor(value * multiplier);
}