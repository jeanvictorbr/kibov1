import { prisma } from '../../../core/database.js';

export default {
    customId: 'cf_action', // Se conecta ao CustomID gerado no comando
    execute: async (interaction) => {
        const parts = interaction.customId.split('_');
        const action = parts[2]; // 'accept' ou 'decline'
        const challengerId = parts[3];
        const targetId = parts[4];
        const amount = parseInt(parts[5]);

        // Trava de segurança: só o desafiado pode clicar nos botões!
        if (interaction.user.id !== targetId) {
            return interaction.reply({ content: 'Tira a mão, chefe! Esse desafio não foi feito para você.', ephemeral: true });
        }

        // AÇÃO: RECUSAR
        if (action === 'decline') {
            return interaction.update({
                content: `❌ <@${targetId}> arregou e fugiu do desafio de **$${amount.toLocaleString('pt-BR')}**! A carteira dele deve estar vazia...`,
                components: []
            });
        }

        // AÇÃO: ACEITAR
        if (action === 'accept') {
            // 1. Dupla Checagem de Saldo (Para evitar que eles gastem o dinheiro no meio do caminho)
            const challenger = await prisma.user.findUnique({ where: { userId: challengerId } });
            const target = await prisma.user.findUnique({ where: { userId: targetId } });

            if (!challenger || challenger.balance < amount) {
                return interaction.update({ content: `❌ <@${challengerId}> tentou dar o golpe! Ele não tem mais o dinheiro na carteira. Aposta cancelada.`, components: [] });
            }
            if (!target || target.balance < amount) {
                return interaction.reply({ content: `❌ Tu não tens **$${amount.toLocaleString('pt-BR')}** na tua carteira para aceitar este desafio, chefe!`, ephemeral: true });
            }

            // 2. Tira o dinheiro dos dois imediatamente (Bloqueia abusos)
            await prisma.user.update({ where: { userId: challengerId }, data: { balance: { decrement: amount } } });
            await prisma.user.update({ where: { userId: targetId }, data: { balance: { decrement: amount } } });

            // 3. Rola o Coinflip (50/50 Exato)
            const winnerId = Math.random() < 0.5 ? challengerId : targetId;
            const loserId = winnerId === challengerId ? targetId : challengerId;

            // 4. Calcula o prêmio (Soma os dois lados - 2% da taxa do cassino)
            const totalPool = amount * 2;
            const fee = Math.floor(totalPool * 0.02);
            const prize = totalPool - fee;

            // 5. Paga ao vencedor
            await prisma.user.update({ where: { userId: winnerId }, data: { balance: { increment: prize } } });

            // 6. Atualiza a mensagem com o resultado final dramático
            return interaction.update({
                content: `# 🪙 A MOEDA CAIU!\n\n⚔️ **Apostas:** $${amount.toLocaleString('pt-BR')} de cada lado.\n🏦 **Lucro do Kibo (2%):** $${fee.toLocaleString('pt-BR')}\n\n🏆 **VENCEDOR:** <@${winnerId}> levou tudo para casa! (**+$${prize.toLocaleString('pt-BR')}**)\n💀 **PERDEDOR:** <@${loserId}> foi de comes e bebes e está mais pobre hoje.`,
                components: []
            });
        }
    }
};