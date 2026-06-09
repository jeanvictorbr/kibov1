import { prisma } from '../../../core/database.js';

// Memória temporária para guardar o tempo de espera (cooldown) dos assaltantes
const cooldowns = new Map();
// Verifica se a vítima tem Colete
const temColete = await prisma.inventory.findFirst({
    where: { userId: targetUser.id, itemId: 'Colete' }
});

if (temColete && Math.random() < 0.5) {
    return message.reply(`🛡️ **FALHA!** O ${targetUser.username} estava usando um **Colete** e você não conseguiu levar nada!`);
}
export default {
    name: 'roubar',
    execute: async (message, args, client, reply, targetUser) => {
        // Ignoramos a função "reply" de embeds do loader e usamos message.reply cru para usar os textos gigantes
        
        if (!targetUser) {
            return message.reply('# 🕵️‍♂️ CADÊ A VÍTIMA?\n**Você precisa marcar alguém ou responder a mensagem de quem você quer assaltar!**');
        }

        if (targetUser.id === message.author.id) {
            return message.reply('# 🤦‍♂️ TÁ MALUCO?\n**Você tá tentando bater a própria carteira, chefe! Escolha outra pessoa.**');
        }

        if (targetUser.bot) {
            return message.reply('# 🤖 ERRO NO SISTEMA!\n**Você não pode roubar bots. A gente não carrega dinheiro físico!**');
        }

        // --- SISTEMA DE COOLDOWN (5 MINUTOS) ---
        const cooldownTime = 5 * 60 * 1000; 
        const lastRobbery = cooldowns.get(message.author.id);

        if (lastRobbery && Date.now() - lastRobbery < cooldownTime) {
            const faltam = Math.ceil((cooldownTime - (Date.now() - lastRobbery)) / 1000 / 60);
            return message.reply(`# 🚓 A POLÍCIA TÁ NA SUA COLA!\n**Esconda-se por mais ${faltam} minuto(s) antes de tentar outro assalto!** 🏃💨`);
        }

        // Busca os dados no Banco de Dados
        const robber = await prisma.user.findUnique({ where: { userId: message.author.id } });
        const victim = await prisma.user.findUnique({ where: { userId: targetUser.id } });

        // Validações de Saldo
        if (!victim || victim.balance < 100) {
            return message.reply(`# 🕸️ VÍTIMA POBRE!\n**A carteira de ${targetUser.username} só tem poeira e teia de aranha.**\nNão vale o risco sujar a ficha por isso!`);
        }

        if (!robber || robber.balance < 100) {
            return message.reply(`# 🛑 BARRADO!\n**Você precisa ter dinheiro na sua própria carteira para pagar a fiança se for pego!**\nArrume uns trocados primeiro.`);
        }

        // --- A MATEMÁTICA DO CRIME ---
        // Aplica o cooldown para ele não floodar o comando
        cooldowns.set(message.author.id, Date.now());

        const successChance = Math.random(); // Gera um número de 0.0 a 1.0

        if (successChance <= 0.45) {
            // ✅ SUCESSO (45% de chance)
            // Rouba um valor aleatório entre 10% e 30% da carteira da vítima
            const percent = (Math.floor(Math.random() * 21) + 10) / 100;
            const stolenAmount = Math.floor(victim.balance * percent);

            // Atualiza os saldos
            await prisma.user.update({ where: { userId: robber.userId }, data: { balance: { increment: stolenAmount } } });
            await prisma.user.update({ where: { userId: victim.userId }, data: { balance: { decrement: stolenAmount } } });

            // Registra no Extrato!
            await prisma.transaction.create({ data: { fromUserId: victim.userId, toUserId: robber.userId, amount: stolenAmount } });

            return message.reply(`# 🥷 ASSALTO BEM SUCEDIDO!\n**Você encostou o ${targetUser.username} num beco e levou $${stolenAmount.toLocaleString()} da carteira dele!**\n*Mete o pé antes que a viatura chegue!* 💰💨`);
        } else {
            // ❌ FRACASSO (55% de chance)
            // Perde de 10% a 20% da PRÓPRIA carteira como indenização para a vítima
            const percent = (Math.floor(Math.random() * 11) + 10) / 100;
            const fine = Math.floor(robber.balance * percent);

            // Paga a multa
            await prisma.user.update({ where: { userId: robber.userId }, data: { balance: { decrement: fine } } });
            await prisma.user.update({ where: { userId: victim.userId }, data: { balance: { increment: fine } } });

            // Registra a multa no extrato
            await prisma.transaction.create({ data: { fromUserId: robber.userId, toUserId: victim.userId, amount: fine } });

            return message.reply(`# 🚓 VOCÊ RODOU!\n**A vítima reagiu e chamou os guardas!**\nVocê tomou um pau e ainda foi obrigado a pagar **$${fine.toLocaleString()}** de indenização para o ${targetUser.username}!\n*Vai curar essas feridas, vagabundo.* 🤕🩸`);
        }
    }
};