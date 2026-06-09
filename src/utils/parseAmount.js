const amount = parseAmount(args[1]);

if (amount === 'ALL') {
    // Aqui você busca o saldo total do usuário no banco de dados e usa esse valor
} else if (amount <= 0) {
    return message.reply('❌ **Valor inválido!** Digite um número ou use `all`.');
} else {
    // Aqui você segue com o processamento normal do valor "amount"
}