export default {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

        // Extrai a base do ID do botão (ex: 'crash_stop_123' vira 'crash_stop')
        let customIdBase = interaction.customId;
        if (interaction.customId.includes('_')) {
            // Ajuste aqui dependendo de como você nomeou os arquivos em /components/
            // Ex: Se o arquivo for 'crash_stop.js', ele pega 'crash_stop'
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
                flags: [ 64 ] // Substitui o 'ephemeral: true' obsoleto
            }).catch(() => {});
        }

        try {
            // "Comprando tempo" do Discord caso o banco de dados demore
            if (interaction.isButton()) {
                await interaction.deferUpdate().catch(() => {});
            }
            
            await component.execute(interaction);
        } catch (error) {
            console.error('Erro na execução do componente:', error);
            // Avisa o usuário sem crashar o bot inteiro
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Ocorreu um erro ao executar esta ação!', flags: [ 64 ] }).catch(() => {});
            } else {
                await interaction.reply({ content: '❌ Ocorreu um erro ao executar esta ação!', flags: [ 64 ] }).catch(() => {});
            }
        }
    }
};