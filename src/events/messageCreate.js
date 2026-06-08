import { sendDevLog } from '../utils/logger.js';
import { parseAmount } from '../utils/parser.js';
import { prisma } from '../core/database.js';
import { sendWebhookResponse } from '../utils/webhookManager.js';
import { createEmbed } from '../utils/embedBuilder.js';

export default {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        // Normalização: transforma 'kperfil' em 'k perfil' para o parser entender
        let content = message.content;
        if (content.startsWith('kperfil')) content = content.replace('kperfil', 'k perfil');
        if (!content.startsWith('k ')) return;

        const args = content.slice(2).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);

        if (!command) return;

        sendDevLog('comando', `Servidor: ${message.guild.name} | Usuário: ${message.author.tag} | Comando: ${commandName}`);

        const guildData = await prisma.guildConfig.findUnique({ where: { guildId: message.guild.id } });

        const argsParsed = args.map(arg => {
            const parsed = parseAmount(arg);
            return parsed !== 0 ? parsed : arg;
        });

        const reply = async (data) => {
            const embed = createEmbed(data);
            if (guildData?.wlActive) {
                await sendWebhookResponse(message.channel, guildData.wlName, guildData.wlAvatar, guildData.wlWebhookUrl, embed);
            } else {
                await message.channel.send({ embeds: [embed] });
            }
        };

        try {
            await command.execute(message, argsParsed, client, reply);
        } catch (error) {
            console.error(error);
            sendDevLog('erro', `Erro em ${commandName}: ${error.stack}`);
            message.reply('Opa chefe, deu um erro técnico na engine do Kibo.');
        }
    }
};