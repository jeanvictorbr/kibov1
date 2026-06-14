import { MessageFlags } from 'discord.js';
import { prisma } from '../../../core/database.js';

export default {
    customId: 'job_select',
    execute: async (interaction) => {
        const selectedJob = interaction.values[0];
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // VERIFICAÇÃO DE JURISDIÇÃO DA POLÍCIA
        if (selectedJob === 'policial') {
            const hasBadge = await prisma.policeBadge.findUnique({
                where: {
                    userId_guildId: { userId, guildId } // Garante que é polícia AQUI
                }
            });

            if (!hasBadge) {
                const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
                const delegadoId = guildConfig?.delegadoId || interaction.guild.ownerId;

                return interaction.reply({
                    content: `❌ **CRACHÁ REJEITADO!** Tu não tens o distintivo desta cidade para seres Polícia.\nQuer entrar para a força? Procura o Delegado <@${delegadoId}> e pede a ele o distintivo!`,
                    flags: [MessageFlags.Ephemeral]
                });
            }
        }

        // SALVA A PROFISSÃO NO BANCO DE DADOS
        // (Garante que a conta do cara existe, se não existir, ele cria)
await prisma.user.upsert({
            where: { userId: userId },
            update: { currentJob: selectedJob }, // Mudou para currentJob
            create: { userId: userId, currentJob: selectedJob }
        });
        // MENSAGENS PERSONALIZADAS DE ACORDO COM A PROFISSÃO
        let responseMsg = '';
        if (selectedJob === 'policial') responseMsg = '🚓 **Distintivo validado!** Tu agora és um Oficial de Polícia. Mantém esta cidade limpa!';
        else if (selectedJob === 'ladrao') responseMsg = '🥷 **Bem-vindo ao Submundo.** Tu agora és um Ladrão. Prepara as ferramentas e tem cuidado com a Polícia.';
        else if (selectedJob === 'hacker') responseMsg = '💻 **Sistema invadido.** Tu és um Hacker. Não te esqueças de limpar os teus rastos digitais.';
        else responseMsg = '👷 **Contrato assinado!** És um Cidadão Honesto. Trabalha duro e paga os teus impostos.';

        await interaction.reply({ 
            content: responseMsg, 
            flags: [MessageFlags.Ephemeral] 
        });
    }
};