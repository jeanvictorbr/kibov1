import { prisma } from '../../../core/database.js';

export default {
    name: 'auditar',
    execute: async (message, args) => {
        // Trava de segurança suprema (Só você pode usar)
        if (message.author.id !== process.env.DEVELOPER_ID) return;

        if (!args[0]) {
            return message.reply('❌ **Uso correto:** `k auditar <ID do Usuário>` ou marque ele com `@usuario`');
        }

        // 1. O FILTRO DE ID: Remove qualquer letra, <, @, ou > e deixa SÓ os números.
        // Assim, tanto faz se você digitar "k auditar @Ze" ou "k auditar 123456789012345678"
        const targetId = args[0].replace(/[^0-9]/g, '');

        if (targetId.length < 15) {
            return message.reply('❌ ID inválido. Um ID do Discord contém apenas números (geralmente 18 dígitos).');
        }

        // 2. BUSCA GLOBAL NO DISCORD: Tenta puxar o nome original do cara na API do Discord
        let discordUser = null;
        try {
            discordUser = await message.client.users.fetch(targetId);
        } catch (error) {
            console.log(`[AUDITORIA] Não foi possível encontrar o usuário do ID ${targetId} no cache do Discord.`);
        }

        const nomeAlvo = discordUser ? `@${discordUser.username}` : `Desconhecido (Fora de alcance)`;

        // 3. BUSCA NO BANCO DE DADOS DA ENGINE
        const user = await prisma.user.findUnique({ where: { userId: targetId } });
        if (!user) {
            return message.reply(`❌ O usuário **${nomeAlvo}** *(ID: ${targetId})* não tem conta registrada na Kibo Engine.`);
        }

        // 4. HISTÓRICO DE TRANSAÇÕES
        const transacoes = await prisma.transaction.findMany({
            where: {
                OR: [ { fromUserId: targetId }, { toUserId: targetId } ]
            },
            orderBy: { id: 'desc' }, // Pega do mais recente pro mais antigo
            take: 15 // Aumentei pra 15 pra te dar um rastro maior
        });

        // 5. MONTA O RELATÓRIO DO FBI
        let relatorio = `### 🔎 AUDITORIA FINANCEIRA GLOBAL\n**Alvo:** ${nomeAlvo}\n**ID:** \`${targetId}\`\n\n💰 **Carteira:** $${user.balance.toLocaleString('pt-BR')}\n🏦 **Banco:** $${user.bank.toLocaleString('pt-BR')}\n\n**Últimas Transações (Pix/Roubo):**\n`;

        if (transacoes.length === 0) {
            relatorio += `\n*Nenhuma transferência P2P (entre jogadores) encontrada. Se houver anomalias no saldo, o dinheiro veio direto de um comando do sistema (ex: Bug no Cassino ou Depósito).*`;
        } else {
            for (const t of transacoes) {
                // Checa se o alvo enviou ou recebeu a grana
                if (t.fromUserId === targetId) {
                    relatorio += `🔴 **ENVIOU** $${t.amount.toLocaleString('pt-BR')} para <@${t.toUserId}>\n`;
                } else {
                    relatorio += `🟢 **RECEBEU** $${t.amount.toLocaleString('pt-BR')} de <@${t.fromUserId}>\n`;
                }
            }
        }

        message.reply({ content: relatorio });
    }
};