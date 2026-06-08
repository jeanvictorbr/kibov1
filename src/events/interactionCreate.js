import { sendDevLog } from '../utils/logger.js';

export default {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

        // Identifica o componente pelo CustomID
        // Usamos o split('_') para pegar apenas a parte principal (ex: pix de "pix_confirm_123")
        const idParts = interaction.customId.split('_');
        const mainId = idParts[0] + (idParts[1] ? `_${idParts[1]}` : ''); 
        
        const component = client.components.get(mainId);

        if (!component) return interaction.reply({ content: 'Componente não encontrado.', ephemeral: true });

        try {
            await component.execute(interaction, client);
        } catch (error) {
            console.error(error);
            sendDevLog('erro', `Erro no componente ${interaction.customId}: ${error.stack}`);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Opa, deu um erro técnico na engine.', ephemeral: true });
            }
        }
    }
};