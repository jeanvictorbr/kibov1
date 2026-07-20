import { prisma } from '../../../core/database.js';

export default {
    name: 'dev_top',
    execute: async (message) => {
        // Trava de segurança suprema
        if (message.author.id !== process.env.DEVELOPER_ID) return;

        // Puxa TODOS os usuários do banco (só as colunas de dinheiro pra não pesar)
        const todosUsuarios = await prisma.user.findMany({
            select: { userId: true, balance: true, bank: true }
        });

        if (todosUsuarios.length === 0) {
            return message.reply('O banco de dados está vazio.');
        }

        // 🧠 O SEGREDO: Soma o Saldo + Banco usando BigInt (para aguentar Quadrilhões)
        const ricos = todosUsuarios
            .map(user => {
                const saldo = BigInt(user.balance || 0);
                const banco = BigInt(user.bank || 0);
                return {
                    ...user,
                    total: saldo + banco
                };
            })
            // Ordena do maior para o menor total
            .sort((a, b) => (a.total < b.total ? 1 : a.total > b.total ? -1 : 0))
            .slice(0, 10); // Pega apenas os 10 mais ricos do mundo

        let relatorio = '### 🚨 RAIO-X DO BANCO DE DADOS (TOP 10 GERAL)\n\n';

        for (let i = 0; i < ricos.length; i++) {
            const alvo = ricos[i];
            relatorio += `**${i + 1}º** | ID: \`${alvo.userId}\`\n💰 Saldo: $${alvo.balance.toLocaleString('pt-BR')} | 🏦 Banco: $${alvo.bank.toLocaleString('pt-BR')}\n💎 **Total Geral:** $${alvo.total.toLocaleString('pt-BR')}\n\n`;
        }

        relatorio += `> *Copie o ID do suspeito e use \`k auditar <ID>\` para rastrear as falcatruas!*`;

        message.reply({ content: relatorio });
    }
};