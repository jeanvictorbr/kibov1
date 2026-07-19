export default {
    name: 'interactionCreate',
    async execute(interaction) {
        // Ignora se não for botão, modal ou menu de seleção
        if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

        let component = null;
        let matchName = "";

        // O Segredo de Ouro: Escaneia todos os componentes e acha o nome correto
        // Funciona perfeito para customIds complexos como "crash_stop_123" ou "tut_nav"
        for (const key of interaction.client.components.keys()) {
            if (interaction.customId.startsWith(key)) {
                if (key.length > matchName.length) {
                    matchName = key;
                    component = interaction.client.components.get(key);
                }
            }
        }

        if (!component) {
            return interaction.reply({ 
                content: '❌ Componente não encontrado ou não configurado na Engine.', 
                flags: [ 64 ] 
            }).catch(() => {});
        }

        try {
            // AQUI NÃO TEM DEFER GLOBAL! Cada arquivo cuida de si.
            await component.execute(interaction);
        } catch (error) {
            console.error(`[ERRO] Falha no componente ${matchName || interaction.customId}:`, error);
            
            const erroMsg = { content: '❌ Ocorreu um erro interno ao processar essa ação!', flags: [ 64 ] };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(erroMsg).catch(() => {});
            } else {
                await interaction.reply(erroMsg).catch(() => {});
            }
        }
    }
};