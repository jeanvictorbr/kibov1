import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateProfileCanvas } from '../../../utils/canvasProfile.js';

export default {
    name: 'perfil',
    execute: async (message, args, client, reply) => {
        // ==========================================
        // 🎯 RADAR DE ALVO: QUEM VAMOS INSPECIONAR?
        // ==========================================
        let targetUser = message.author; // Padrão: mostra o perfil de quem digitou o comando

        // 1. Verifica se o comando foi usado RESPONDENDO a uma mensagem
        if (message.reference && message.reference.messageId) {
            try {
                const msgRespondida = await message.channel.messages.fetch(message.reference.messageId);
                targetUser = msgRespondida.author;
            } catch (err) {
                console.log("[PERFIL] Erro ao buscar a mensagem respondida.");
            }
        } 
        // 2. Verifica se marcou alguém (@usuario) ou passou o ID direto
        else if (args[0]) {
            const possibleId = String(args[0]).replace(/[^0-9]/g, '');
            // IDs do Discord geralmente têm 17 a 19 números
            if (possibleId.length >= 15) {
                try {
                    targetUser = await message.client.users.fetch(possibleId);
                } catch (err) {
                    return message.reply('❌ **Usuário não encontrado!** Verifique se o ID ou a marcação está correta.');
                }
            }
        }

        // 3. Trava de Segurança
        if (targetUser.bot) {
            return message.reply('🤖 **Erro no Sistema:** Bots são máquinas limpas, não possuem ficha criminal nem perfil na Kibo Engine!');
        }

        // ==========================================
        // 🔍 BUSCA E GERAÇÃO DO PERFIL
        // ==========================================
        
        // Busca o alvo no banco ou cria se não existir
        let user = await prisma.user.findUnique({
            where: { userId: targetUser.id }
        });

        if (!user) {
            user = await prisma.user.create({
                data: { userId: targetUser.id }
            });
        }

        try {
            // Gera o perfil visual enviando o alvo (targetUser) em vez do dono da mensagem
            const buffer = await generateProfileCanvas(targetUser, user);
            const attachment = new AttachmentBuilder(buffer, { name: 'perfil_kibo.png' });

            await message.channel.send({ files: [attachment] });
        } catch (err) {
            console.error("Erro ao gerar perfil:", err);
            // Uso de fallback caso a função de reply do seu handler dê algum aviso
            const erroMsg = '❌ Opa chefe, tive um problema ao desenhar o perfil. Tenta novamente.';
            if (typeof reply === 'function') {
                reply({ description: erroMsg }).catch(() => message.reply(erroMsg));
            } else {
                message.reply(erroMsg);
            }
        }
    }
};