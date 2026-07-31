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
                    userId_guildId: { userId, guildId } 
                }
            });

            if (!hasBadge) {
                const guildConfig = await prisma.guildConfig.findUnique({ where: { guildId } });
                const delegadoId = guildConfig?.delegadoId || interaction.guild.ownerId;

                return interaction.reply({
                    content: `❌ **CRACHÁ REJEITADO!** Você não tem o distintivo dessa cidade, mano.\nQuer entrar pra força? Dá um salve no Delegado <@${delegadoId}> e pede pra ele te contratar!`,
                    flags: [MessageFlags.Ephemeral]
                });
            }
        }

        // SALVA A PROFISSÃO NO BANCO DE DADOS
        await prisma.user.upsert({
            where: { userId: userId },
            update: { currentJob: selectedJob }, 
            create: { userId: userId, currentJob: selectedJob }
        });

        // MENSAGENS NA GÍRIA SP
        let responseMsg = '';
        if (selectedJob === 'policial') responseMsg = '🚓 **Distintivo validado!** Agora você é um Oficial da PM. Mantém a quebrada limpa, chefe!';
        else if (selectedJob === 'ladrao') responseMsg = '🥷 **Bem-vindo ao Submundo.** Você virou Ladrão. Prepara o cano e toma cuidado com a ROTA.';
        else if (selectedJob === 'hacker') responseMsg = '💻 **Sistema invadido.** Você é um Hacker. Não esquece de apagar seu IP pra não rodar.';
        else if (selectedJob === 'medico') responseMsg = '🩺 **Plantão assumido!** Você é Médico. Sempre que alguém cair no morro, é você que costura. Cobre caro: `k tratar @ferido [valor]`.';
        else if (selectedJob === 'advogado') responseMsg = '⚖️ **OAB na carteira!** Você é Advogado. Se um aliado rodar na cana, tira ele na lábia: `k advogar @preso [valor]`.';
        else if (selectedJob === 'seguranca') responseMsg = '👮 **Vigilância contratada!** Você é Segurança Privado. Blinda os clientes de assalto: `k segurar @cliente [valor]`.';
        else if (selectedJob === 'sequestrador') responseMsg = '🧨 **Plano armado!** Você é Sequestrador. Só mira em quem tem **$30.000+** na conta: `k sequestrar @rico`.';
        else if (selectedJob === 'contrabandista') responseMsg = '📦 **Rota mapeada!** Você é Contrabandista. A mercadoria entra suja e a polícia pode cruzar seu caminho: `k contrabandear`.';
        else responseMsg = '👷 **Contrato assinado!** Você é um Cidadão Honesto. Trabalha duro e foge do crime.';

        await interaction.reply({ 
            content: responseMsg, 
            flags: [MessageFlags.Ephemeral] 
        });
    }
};