export default {
    name: 'interactionCreate',
    async execute(interaction) {
        // Ignora se não for botão, modal ou menu
        if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

        // Extrai a base do ID do botão para achar o arquivo na pasta components
        let customIdBase = interaction.customId;
        if (interaction.customId.includes('_')) {
            const parts = interaction.customId.split('_');
            if (parts.length > 2) {
                customIdBase = `${parts[0]}_${parts[1]}`;
            } else {
                customIdBase = parts[0];
            }
        }

        const component = interaction.client.components.get(customIdBase);

        if (!component) {
            return interaction.reply({ 
                content: '❌ Componente não configurado na Engine.', 
                flags: [ 64 ] 
            }).catch(() => {});
        }

        try {
            // Executa o componente DIRETAMENTE, sem interferir na interação
            await component.execute(interaction);
        } catch (error) {
            console.error('Erro na execução do componente:', error);
            
            // Tenta avisar o usuário que deu erro de forma segura
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Ocorreu um erro ao executar esta ação!', flags: [ 64 ] }).catch(() => {});
            } else {
                await interaction.reply({ content: '❌ Ocorreu um erro ao executar esta ação!', flags: [ 64 ] }).catch(() => {});
            }
        }
    }
};