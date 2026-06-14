import { sendDevLog } from '../utils/logger.js';
import { parseAmount } from '../utils/parser.js';
import { prisma } from '../core/database.js';
import { sendWebhookResponse } from '../utils/webhookManager.js';
import { createEmbed } from '../utils/embedBuilder.js';

export default {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        const content = message.content.trim();
        
        // 🛠️ CORREÇÃO AQUI: Agora aceita comandos com underline (_)
        const prefixRegex = /^k\s*([a-zA-Z_]+)(.*)/i; 
        const match = content.match(prefixRegex);
        
        if (!match) return; 

        const commandName = match[1].toLowerCase();
        const argsRaw = match[2].trim();
        const args = argsRaw ? argsRaw.split(/ +/) : [];

        const command = client.commands.get(commandName);
        if (!command) return;

        // SISTEMA DE SEGURANÇA INTERNA: Checagem de Banimento Global
        let userData = await prisma.user.findUnique({ where: { userId: message.author.id } });
        if (userData?.isBanned) {
            return message.reply('Você tá banido de usar nosso sistema, chefe ;(');
        }

        // 🚨 SISTEMA DE PRISÃO (ALCATRAZ) 🚨
        const jailCooldown = await prisma.cooldown.findUnique({
            where: { userId_command: { userId: message.author.id, command: 'preso' } }
        });

        if (jailCooldown && jailCooldown.expiresAt > new Date()) {
            if (commandName !== 'fuga' && commandName !== 'subornar') {
                const minutosRestantes = Math.ceil((jailCooldown.expiresAt - new Date()) / 60000);
                return message.reply(`🚓 **A casa caiu, chefe!** Você tá puxando cadeia em Alcatraz e não pode fazer nada na rua.\nManda um \`k fuga\` se tiver coragem de tentar escapar, desenrola um \`k subornar @policial\` ou mofa aí por mais **${minutosRestantes} minutos**!`);
            }
        }

        // Captura de Alvo Inteligente
        let targetUser = message.mentions.users.first();
        if (!targetUser && message.reference) {
            try {
                const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
                targetUser = repliedMsg.author;
            } catch (err) {
                console.error("Erro ao buscar mensagem respondida.");
            }
        }

        const argsParsed = args.map(arg => {
            const parsed = parseAmount(arg);
            return parsed !== 0 ? parsed : arg;
        });

        sendDevLog('comando', `Servidor: ${message.guild.name} | Usuário: ${message.author.tag} | Comando: ${commandName}`);

        const guildData = await prisma.guildConfig.findUnique({ where: { guildId: message.guild.id } });

        const reply = async (data) => {
            const embed = createEmbed(data);
            if (guildData?.wlActive) {
                await sendWebhookResponse(message.channel, guildData.wlName, guildData.wlAvatar, guildData.wlWebhookUrl, embed);
            } else {
                await message.channel.send({ embeds: [embed] });
            }
        };

        try {
            await command.execute(message, argsParsed, client, reply, targetUser);
        } catch (error) {
            console.error(error);
            sendDevLog('erro', `Erro em ${commandName}: ${error.stack}`);
            message.reply('Opa chefe, deu um erro técnico na engine do Kibo. Os mecânicos já tão de olho.');
        }
    }
};