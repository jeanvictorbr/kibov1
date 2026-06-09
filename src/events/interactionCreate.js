// src/events/interactionCreate.js
export default {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

        // Pega apenas a primeira parte do ID (ex: "crash_stop" de "crash_stop_123_456")
        const idParts = interaction.customId.split('_');
        const mainId = `${idParts[0]}_${idParts[1]}`; 
        
        const component = client.components.get(mainId);

        if (!component) return interaction.reply({ content: 'Componente não configurado.', ephemeral: true });

        try {
            await component.execute(interaction, client);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'Erro na Engine.', ephemeral: true });
        }
    }
};