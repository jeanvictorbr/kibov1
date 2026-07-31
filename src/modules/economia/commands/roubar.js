import { prisma } from '../../../core/database.js';
import { getFactionOfUser } from '../../../utils/factionService.js';
import { scoreWarPoint } from '../../../utils/factionService.js';
import { getActiveBuffEffects, hasActiveCooldown } from '../../../utils/buffService.js';

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

        // 👮 Segurança Privado: a vítima tá blindada
        if (await hasActiveCooldown(targetUser.id, 'protegido')) {
            return message.reply(`# 🛡️ BLINDADO!\n**${targetUser.username} contratou um **Segurança Privado**! Você tentou chegar perto e um capanga te encarou. Recua, chefe.**`);
        }

        // 🤕 Assaltante ferido não consegue agir
        if (await hasActiveCooldown(message.author.id, 'ferido')) {
            return message.reply('# 🤕 TÁ TODO MOÍDO!\n**Você tá ferido do último rolo e não consegue nem correr. Procura um Médico (`k tratar @medico`)!**');
        }

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
        const agilidadeLvl = skills.agilidade || 1;
        const forcaLvl = skills.forca || 1;
        const intimidacaoLvl = skills.intimidacao || 1;

        const bonusSorte = sorteLvl * 0.05; // Aumenta lucro em +5% por nível
        const bonusLabia = labiaLvl * 0.05; // Desconto na multa de 5% por nível
        const bonusForca = forcaLvl * 0.07; // Aumenta roubo em +7% por nível
        const bonusIntimidacao = intimidacaoLvl * 0.02; // +2% de chance de sucesso por nível

        // --- SISTEMA DE COOLDOWN PADRÃO (5 MINUTOS) ---
        // 💨 Agilidade reduz o tempo de espera em 4% por nível (mínimo de 1 minuto)
        const cooldownTime = Math.max(60 * 1000, 5 * 60 * 1000 * (1 - agilidadeLvl * 0.04));
        const lastRobbery = cooldowns.get(message.author.id);

        // Só barra o cara se ele NÃO tiver a imunidade do Hacker Especialista
        if (!temImunidade && lastRobbery && Date.now() - lastRobbery < cooldownTime) {
            const faltam = Math.ceil((cooldownTime - (Date.now() - lastRobbery)) / 1000 / 60);
            return message.reply(`# 🚓 A POLÍCIA TÁ NA SUA COLA!\n**Esconda-se por mais ${faltam} minuto(s) antes de tentar outro assalto!** 🏃💨`);
        }

        // Atualiza o tempo do último roubo na memória
        cooldowns.set(message.author.id, Date.now());

        const successChance = Math.random(); 
        const msgImunidade = temImunidade ? `\n> 🥷 *Seu IP foi mascarado pelo Especialista! Nenhum tempo de espera foi gerado.*` : '';

        // 🔫 Buff de facção (Armas): +3% de sucesso por nível da facção (cap 15%)
        const faction = await getFactionOfUser(message.author.id, message.guild.id);
        // 🔫 Buff de arma (item): +5%/+10% de sucesso enquanto ativa
        const buffEffects = await getActiveBuffEffects(message.author.id);
        let successThreshold = 0.45 + bonusIntimidacao + buffEffects.sucesso; // 🕵️ Intimidação + Arma aumentam a chance
        let msgFac = '';
        if (buffEffects.sucesso > 0) {
            msgFac = `\n*🔫 Sua arma ilegal garantiu +${(buffEffects.sucesso * 100).toFixed(0)}% de chance de sucesso!*`;
        }
        if (faction) {
            if (faction.ramo === 'armas') {
                const bonusArma = Math.min(0.15, faction.nivel * 0.03);
                successThreshold += bonusArma;
                msgFac += `\n*🔫 Sua facção **${faction.name}** te garantiu +${(bonusArma * 100).toFixed(0)}% de chance de sucesso!*`;
            }
        }

        // --- 1. SUCESSO (APLICA A SORTE E A FORÇA) ---
        if (successChance <= successThreshold) {
            const percent = (Math.floor(Math.random() * 21) + 10) / 100; // Rouba entre 10% a 30%
            let baseStolen = Math.floor(victim.balance * percent);
            
            // Aumenta o valor roubado usando o nível de Sorte
            let finalStolen = Math.floor(baseStolen * (1 + bonusSorte));
            // 💪 Força esmaga as defesas da vítima e aumenta ainda mais o saque
            finalStolen = Math.floor(finalStolen * (1 + bonusForca));
            // 💊 Buff de facção (Tráfico): +5% no valor roubado
            if (faction?.ramo === 'trafico') {
                finalStolen = Math.floor(finalStolen * 1.05);
                msgFac = `\n*💊 A facção **${faction.name}** turbinou o saque em +5%!*`;
            }
            
            // Trava de Segurança: não deixa o valor roubado ser maior do que a vítima realmente tem
            finalStolen = Math.min(finalStolen, victim.balance);

            // 🧼 Metade do saque é grana suja (precisa ser lavada com `k lavar`)
            const limpo = Math.floor(finalStolen * 0.5);
            const sujo = finalStolen - limpo;

            await prisma.user.update({ where: { userId: robber.userId }, data: { balance: { increment: limpo }, dirtyMoney: { increment: sujo } } });
            await prisma.user.update({ where: { userId: victim.userId }, data: { balance: { decrement: finalStolen } } });

            await prisma.transaction.create({ data: { fromUserId: victim.userId, toUserId: robber.userId, amount: finalStolen } });

            // ⚔️ Ponto de guerra se for contra facção inimiga
            let warMsg = '';
            if (faction) {
                const victimFaction = await getFactionOfUser(victim.userId, message.guild.id);
                if (victimFaction && victimFaction.id !== faction.id) {
                    const war = await scoreWarPoint(faction.id, victimFaction.id);
                    if (war) warMsg = `\n⚔️ **PONTO DE GUERRA!** Sua facção marcou +1 contra **${victimFaction.name}** no confronto!`;
                }
            }

            return message.reply(`# 🥷 ASSALTO BEM SUCEDIDO!\n**Você encostou o ${targetUser.username} num beco e levou $${finalStolen.toLocaleString('pt-BR')} da carteira dele!**\n> 💵 **Limpo:** $${limpo.toLocaleString('pt-BR')} direto na conta\n> 🧼 **Sujo:** $${sujo.toLocaleString('pt-BR')} na lavagem — use \`k lavar\`!\n*Mete o pé antes que a viatura chegue!* 💰💨\n*🍀 A sua **Sorte (Nível ${sorteLvl})** garantiu +${(bonusSorte * 100).toFixed(0)}% a mais no montante do saque!*\n*💪 A sua **Força (Nível ${forcaLvl})** rendeu +${(bonusForca * 100).toFixed(0)}% no valor levado!*\n*🕵️ A sua **Intimidação (Nível ${intimidacaoLvl})** deixou a vítima paralisada de medo (+${(bonusIntimidacao * 100).toFixed(0)}% de chance de sucesso)!*${warMsg}${msgFac}${msgImunidade}`);
        
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

            let feridoMsg = '';
            if (Math.random() < 0.25) {
                // 🤕 25% de chance de se machucar na fuga
                await prisma.cooldown.upsert({
                    where: { userId_command: { userId: robber.userId, command: 'ferido' } },
                    update: { expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
                    create: { userId: robber.userId, command: 'ferido', expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
                });
                feridoMsg = '\n🤕 **Você se machucou na fuga!** Tá ferido por 15 minutos. Procura um **Médico** (`k tratar @medico`) ou fica de molho!';
            }

            // ⚔️ Ponto de DEFESA da facção da vítima se estiver em guerra
            let warMsg = '';
            if (faction) {
                const victimFaction = await getFactionOfUser(victim.userId, message.guild.id);
                if (victimFaction && victimFaction.id !== faction.id) {
                    const war = await scoreWarPoint(victimFaction.id, faction.id);
                    if (war) warMsg = `\n⚔️ **PONTO DE DEFESA!** A facção **${victimFaction.name}** marcou +1 ao te barrar!`;
                }
            }

            return message.reply(`# 🚓 VOCÊ RODOU!\n**A vítima reagiu e chamou os guardas!**\nVocê tomou um pau e ainda foi obrigado a pagar **$${finalFine.toLocaleString('pt-BR')}** de indenização para o ${targetUser.username}!\n*Vai curar essas feridas, vagabundo.* 🤕🩸\n*🗣️ A sua **Lábia (Nível ${labiaLvl})** impressionou a polícia e te deu ${(bonusLabia * 100).toFixed(0)}% de desconto na multa!*${warMsg}${feridoMsg}${msgImunidade}`);
        }
    }
};