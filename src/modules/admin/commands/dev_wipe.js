import { prisma } from '../../../core/database.js';

export default {
    name: 'dev_wipe',
    execute: async (message, args) => {
        // Trava de segurança suprema (Apenas o dono do Bot)
        if (message.author.id !== process.env.DEVELOPER_ID) return;

        let targetId = null;
        let targetName = "Conta Fantasma (Excluída/Laranja)"; 

        // 1. Verifica se foi por "Responder" (Reply)
        if (message.reference && message.reference.messageId) {
            try {
                const msgRespondida = await message.channel.messages.fetch(message.reference.messageId);
                targetId = msgRespondida.author.id;
                targetName = msgRespondida.author.username;
            } catch (err) {}
        } 
        else {
            // 2. 🔥 BYPASS NO SISTEMA: IGNORA O `args` CORROMPIDO!
            // Vasculha o texto puro que você digitou em busca de 15 a 20 números seguidos.
            // Assim o JavaScript não arredonda o ID pra zero.
            const rawIdMatch = message.content.match(/\d{15,20}/);
            if (rawIdMatch) {
                targetId = rawIdMatch[0]; // Pega o ID idêntico ao que você digitou
            }
        }

        // Se o radar não achar um ID válido, bloqueia
        if (!targetId) {
            return message.reply('❌ **ID inválido ou Alvo não encontrado!** Responda uma mensagem, marque o `@` ou digite um ID numérico correto.');
        }

        // Tenta achar na API do Discord só pra ter o nome original (se não achar, a gente ignora)
        try {
            const fetchedUser = await message.client.users.fetch(targetId);
            targetName = fetchedUser.username;
            if (fetchedUser.bot) return message.reply('🤖 **Negado:** Não faz sentido dar Wipe num Bot.');
        } catch (error) {
            console.log(`[WIPE] Alvo ${targetId} não existe no Discord. Wipando direto no banco de dados.`);
        }

        try {
            // Verifica se a conta existe no BANCO DE DADOS
            const conta = await prisma.user.findUnique({ where: { userId: targetId } });
            
            if (!conta) {
                return message.reply(`❌ A conta de ID **${targetId}** não possui saldo ou registro no Banco de Dados.`);
            }
            
            // 1. Zera a economia absoluta
            await prisma.user.update({
                where: { userId: targetId },
                data: { balance: 0, bank: 0 }
            });

            // 2. Confisca todos os itens do Inventário
            await prisma.inventory.deleteMany({
                where: { userId: targetId }
            });

            return message.reply(`# 🚨 DECRETO DE FALÊNCIA ACIONADO!\nA conta **${targetName}** *(ID: \`${targetId}\`)* foi rastreada e teve todos os seus bens confiscados!\n\n> 💸 **Nova Carteira:** $0\n> 🏦 **Novo Banco:** $0\n> 🎒 **Inventário:** Vazio (Confiscado)\n\n*A anomalia foi corrigida no banco de dados com sucesso.*`);

        } catch (error) {
            console.error('[ERRO NO WIPE]', error);
            return message.reply('❌ **Erro Crítico:** Ocorreu uma falha no Prisma ao tentar aplicar o Wipe.');
        }
    }
};