import { AttachmentBuilder } from 'discord.js';
import { prisma } from '../../../core/database.js';
import { generateCdCanvas } from '../../../utils/canvasCd.js';

export default {
    name: 'cd',
    execute: async (message) => {
        const userId = message.author.id;
        
        // Lista completa de chaves armazenadas no banco de dados
        const commandsToCheck = [
            'executar', 'daily', 'mensal', 
            'int_abracar', 'int_socar', 
            'int_dancar', 'int_morder', 'int_chutar'
        ];
        
        // Busca apenas os cooldowns existentes no banco para este usuário
        const userCds = await prisma.cooldown.findMany({ where: { userId } });

        // Mapeia para saber o status de cada um
        const statusList = commandsToCheck.map(cmdKey => {
            const cd = userCds.find(c => c.command === cmdKey);
            
            // Remove o prefixo 'int_' para exibir um nome limpo na imagem
            const displayName = cmdKey.replace('int_', '');

            if (cd && new Date(cd.expiresAt) > new Date()) {
                return { 
                    command: displayName, 
                    expiresAt: cd.expiresAt, 
                    status: 'active' 
                };
            }
            return { 
                command: displayName, 
                status: 'available' 
            };
        });

        // Gera a imagem do painel
        const buffer = await generateCdCanvas(message.author, statusList);
        const attachment = new AttachmentBuilder(buffer, { name: 'cd_panel.png' });

        await message.channel.send({ files: [attachment] });
    }
};