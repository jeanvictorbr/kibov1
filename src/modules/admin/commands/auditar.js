import { prisma } from '../../../core/database.js';
import { EmbedBuilder } from 'discord.js';

export default {
    name: 'auditar',
    execute: async (message, args) => {
        // Trava de segurança suprema (Só você pode usar)
        if (message.author.id !== process.env.DEVELOPER_ID) return;

        const targetId = args[0]?.replace(/[<@!>]/g, '');
        if (!targetId) {
            return message.reply('❌ **Uso correto:** `k auditar @usuario` ou `k auditar <ID>`');
        }

        // 1. Puxa os dados atuais do suspeito
        const user = await prisma.user.findUnique({ where: { userId: targetId } });
        if (!user) {
            return message.reply('❌ Esse usuário não tem registro no banco de dados da economia.');
        }

        // 2. Puxa as últimas 10 transações envolvendo ele (seja enviando ou recebendo)
        const transacoes = await prisma.transaction.findMany({
            where: {
                OR: [ { fromUserId: targetId }, { toUserId: targetId } ]
            },
            orderBy: { id: 'desc' }, // Pega as mais recentes
            take: 10
        });

        // 3. Monta o relatório
        let relatorio = `### 🔎 AUDITORIA FINANCEIRA\n**Alvo:** <@${targetId}>\n**Carteira:** $${user.balance.toLocaleString('pt-BR')}\n**Banco:** $${user.bank.toLocaleString('pt-BR')}\n\n**Últimas Transações (Pix/Roubo):**\n`;

        if (transacoes.length === 0) {
            relatorio += `*Nenhuma transação P2P encontrada. O dinheiro provavelmente veio do sistema (Cassino, Mines, Trabalhar, Daily).*`;
        } else {
            for (const t of transacoes) {
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