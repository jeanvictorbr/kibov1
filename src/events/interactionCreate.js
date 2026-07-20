export default {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

        let customIdBase = interaction.customId;
        let component = interaction.client.components.get(customIdBase);

        // O Motor de Busca Definitivo: Corta os underlines e tenta achar o arquivo correto!
        // Ex: "usar_select_12345" -> não achou -> tenta "usar_select" -> ACHOU!
        if (!component && interaction.customId.includes('_')) {
            const parts = interaction.customId.split('_');
            for (let i = parts.length; i > 0; i--) {
                const tryKey = parts.slice(0, i).join('_');
                if (interaction.client.components.has(tryKey)) {
                    component = interaction.client.components.get(tryKey);
                    break;
                }
            }
        }

        if (!component) {
            console.log(`[ERRO] Componente fantasma clicado: ${interaction.customId}`);
            return interaction.reply({ 
                content: '❌ Falha de comunicação com o servidor. Componente não configurado.', 
                ephemeral: true 
            }).catch(() => {});
        }

        try {
            await component.execute(interaction);
        } catch (error) {
            console.error(`[CRASH NO COMPONENTE] ${interaction.customId}:`, error);
            const erroMsg = { content: '❌ A Engine sofreu um erro interno ao processar essa ação!', ephemeral: true };
            
            // Tenta avisar o usuário do erro, dependendo de como a interação está
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(erroMsg).catch(() => {});
            } else {
                await interaction.reply(erroMsg).catch(() => {});
            }
        }
    }
};