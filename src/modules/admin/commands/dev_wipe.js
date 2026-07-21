import { prisma } from '../../../core/database.js';

export default {
    name: 'dev_wipe',
    execute: async (message, args) => {
        // Trava de segurança suprema (Apenas o dono do Bot)
        if (message.author.id !== process.env.DEVELOPER_ID) return;

        // ==========================================
        // 🎯 RADAR DE ALVO (Inteligência de Busca)
        // ==========================================
        let targetUser = null;

        // 1. Verifica se foi por "Responder" (Reply)
        if (message.reference && message.reference.messageId) {
            try {
                const msgRespondida = await message.channel.messages.fetch(message.reference.messageId);
                targetUser = msgRespondida.author;
            } catch (err) {
                console.log("[WIPE] Erro ao buscar mensagem respondida.");
            }
        } 
        // 2. Verifica se usou Menção ou ID
        else if (args[0]) {
            const possibleId = String(args[0]).replace(/[^0-9]/g, '');
            if (possibleId.length >= 15) {
                try {
                    targetUser = await message.client.users.fetch(possibleId);
                } catch (err) {
                    // Ignora o erro e avisa lá embaixo
                }
            }
        }

        // Se o radar não achar ninguém, bloqueia o comando
        if (!targetUser) {
            return message.reply('❌ **Alvo não encontrado!** Responda uma mensagem do cara, marque o `@` dele ou digite o ID numérico.');
        }

        if (targetUser.bot) {
            return message.reply('🤖 **Negado:** Não faz sentido dar Wipe num Bot.');
        }

        try {
            // Verifica se a conta existe no banco
            const conta = await prisma.user.findUnique({ where: { userId: targetUser.id } });
            
            if (!conta) {
                return message.reply(`❌ O usuário **${targetUser.username}** não tem registro na Kibo Engine.`);
            }

            // ==========================================
            // 🚨 OPERAÇÃO DE WIPE (Reset Absoluto)
            // ==========================================
            
            // 1. Zera completamente a economia definindo um valor fixo absoluto (0)
            await prisma.user.update({
                where: { userId: targetUser.id },
                data: {
                    balance: 0,
                    bank: 0
                }
            });

            // 2. Confisca todos os itens (Apaga o Inventário do Alvo)
            await prisma.inventory.deleteMany({
                where: { userId: targetUser.id }
            });

            // Retorno triunfal no chat
            return message.reply(`# 🚨 DECRETO DE FALÊNCIA ACIONADO!\nO usuário **${targetUser.username}** *(ID: \`${targetUser.id}\`)* teve todos os seus bens confiscados pela Receita Federal da Kibo Engine!\n\n> 💸 **Nova Carteira:** $0\n> 🏦 **Novo Banco:** $0\n> 🎒 **Inventário:** Vazio (Confiscado)\n\n*A conta foi resetada aos padrões de fábrica e ele voltou a ser um indigente na rua.*`);

        } catch (error) {
            console.error('[ERRO NO WIPE]', error);
            return message.reply('❌ **Erro Crítico:** Ocorreu uma falha no banco de dados ao tentar aplicar o Wipe.');
        }
    }
};