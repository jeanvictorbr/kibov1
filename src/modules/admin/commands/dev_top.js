import { prisma } from '../../../core/database.js';

export default {
    name: 'dev_top',
    execute: async (message) => {
        // Trava de segurança: Só você pode ver isso
        if (message.author.id !== process.env.DEVELOPER_ID) return;

        // Puxa os 10 mais ricos direto do banco de dados (ignorando se estão no servidor ou não)
        const ricos = await prisma.user.findMany({
            orderBy: { balance: 'desc' },
            take: 10
        });

        if (ricos.length === 0) {
            return message.reply('O banco de dados está vazio.');
        }

        let relatorio = '### 🚨 RAIO-X DO BANCO DE DADOS (TOP 10)\n\n';

        for (let i = 0; i < ricos.length; i++) {
            const alvo = ricos[i];
            relatorio += `**${i + 1}º** | ID: \`${alvo.userId}\`\n💰 Saldo: $${alvo.balance.toLocaleString('pt-BR')} | 🏦 Banco: $${alvo.bank.toLocaleString('pt-BR')}\n\n`;
        }

        relatorio += `> *Copie o ID do suspeito e use \`k auditar <ID>\` para investigar de onde veio o dinheiro!*`;

        message.reply({ content: relatorio });
    }
};