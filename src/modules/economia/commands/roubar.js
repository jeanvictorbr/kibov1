import { prisma } from '../../../core/database.js';

// Memória temporária para guardar o tempo de espera (cooldown) dos assaltantes
const cooldowns = new Map();

export default {
    name: 'roubar',
    execute: async (message, args, client, reply, targetUser) => {
        
        if (!targetUser) {
            return message.reply('# 🕵️‍♂️ CADÊ A VÍTIMA?\n**Você precisa marcar alguém ou responder a mensagem de quem você quer assaltar!**');
        }

        // --- VERIFICAÇÃO DO ITEM (COLETE) ---
        const temColete = await prisma.inventory.findFirst({
            where: { userId: targetUser.id, itemId: 'Colete' }
        });

        if (temColete && Math.random() < 0.5) {
            return message.reply(`🛡️ **FALHA!** O ${targetUser.username} estava usando um **Colete** e você não conseguiu levar nada!`);
        }

        if (targetUser.id === message.author.id) {
            return message.reply('# 🤦‍♂️ TÁ MALUCO?\n**Você tá tentando bater a própria carteira, chefe! Escolha outra pessoa.**');
        }

        if (targetUser.bot) {
            return message.reply('# 🤖 ERRO NO SISTEMA!\n**Você não pode roubar bots. A gente não carrega dinheiro físico!**');
        }

        // ==========================================
        // 🥷 VERIFICAÇÃO DO BUFF (ESPECIALISTA)
        // ==========================================
        const buffEspecialista = await prisma.cooldown.findUnique({
            where: { userId_command: { userId: message.author.id, command: 'buff_especialista' } }
        });

        // Retorna true se o buff existir e ainda não tiver expirado
        const temImunidade = buffEspecialista && buffEspecialista.expiresAt > new Date();

        // --- SISTEMA DE COOLDOWN PADRÃO (5 MINUTOS) ---
        const cooldownTime = 5 * 60 * 1000; 
        const lastRobbery = cooldowns.get(message.author.id);

        // Só barra o cara se ele NÃO tiver a imunidade do Hacker Especialista
        if (!temImunidade && lastRobbery && Date.now() - lastRobbery < cooldownTime) {
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

        // --- HABILIDADES DO ASSALTANTE ---
        const skills = typeof robber.skills === 'string' ? JSON.parse(robber.skills) : (robber.skills || {});
        const sorteLvl = skills.sorte || 1;
        const labiaLvl = skills.labia || 1;

        const bonusSorte = sorteLvl * 0.05; // Aumenta lucro em +5% por nível
        const bonusLabia = labiaLvl * 0.05; // Desconto na multa de 5% por nível

        // Atualiza o tempo do último roubo na memória
        cooldowns.set(message.author.id, Date.now());

        const successChance = Math.random(); 
        const msgImunidade = temImunidade ? `\n> 🥷 *Seu IP foi mascarado pelo Especialista! Nenhum tempo de espera foi gerado.*` : '';

        // --- 1. SUCESSO (APLICA A SORTE) ---
        if (successChance <= 0.45) {
            const percent = (Math.floor(Math.random() * 21) + 10) / 100; // Rouba entre 10% a 30%
            let baseStolen = Math.floor(victim.balance * percent);
            
            // Aumenta o valor roubado usando o nível de Sorte
            let finalStolen = Math.floor(baseStolen * (1 + bonusSorte));
            
            // Trava de Segurança: não deixa o valor roubado ser maior do que a vítima realmente tem
            finalStolen = Math.min(finalStolen, victim.balance);

            await prisma.user.update({ where: { userId: robber.userId }, data: { balance: { increment: finalStolen } } });
            await prisma.user.update({ where: { userId: victim.userId }, data: { balance: { decrement: finalStolen } } });

            await prisma.transaction.create({ data: { fromUserId: victim.userId, toUserId: robber.userId, amount: finalStolen } });

            return message.reply(`# 🥷 ASSALTO BEM SUCEDIDO!\n**Você encostou o ${targetUser.username} num beco e levou $${finalStolen.toLocaleString('pt-BR')} da carteira dele!**\n*Mete o pé antes que a viatura chegue!* 💰💨\n*🍀 A sua **Sorte (Nível ${sorteLvl})** garantiu +${(bonusSorte * 100).toFixed(0)}% a mais no montante do saque!*${msgImunidade}`);
        
        // --- 2. FRACASSO E PRISÃO (APLICA A LÁBIA) ---
        } else {
            const percent = (Math.floor(Math.random() * 11) + 10) / 100; // Multa de 10% a 20%
            let baseFine = Math.floor(robber.balance * percent);

            // Reduz o valor da multa usando a Lábia para convencer os Policiais
            let finalFine = Math.floor(baseFine * (1 - bonusLabia));
            finalFine = Math.max(finalFine, 1); // A multa mínima será sempre de 1 dólar

            await prisma.user.update({ where: { userId: robber.userId }, data: { balance: { decrement: finalFine } } });
            await prisma.user.update({ where: { userId: victim.userId }, data: { balance: { increment: finalFine } } });

            await prisma.transaction.create({ data: { fromUserId: robber.userId, toUserId: victim.userId, amount: finalFine } });

            return message.reply(`# 🚓 VOCÊ RODOU!\n**A vítima reagiu e chamou os guardas!**\nVocê tomou um pau e ainda foi obrigado a pagar **$${finalFine.toLocaleString('pt-BR')}** de indenização para o ${targetUser.username}!\n*Vai curar essas feridas, vagabundo.* 🤕🩸\n*🗣️ A sua **Lábia (Nível ${labiaLvl})** impressionou a polícia e te deu ${(bonusLabia * 100).toFixed(0)}% de desconto na multa!*${msgImunidade}`);
        }
    }
};