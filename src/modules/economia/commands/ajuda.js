import { EmbedBuilder } from 'discord.js';

export default {
    name: 'ajuda',
    execute: async (message) => {
        const embed = new EmbedBuilder()
            .setTitle('📖 MANUAL DO IMPÉRIO KIBO')
            .setDescription('Bem-vindo à central de ajuda, chefe! Aqui estão todos os comandos para você dominar a economia e o submundo do servidor.')
            .setColor('#FFD700') // Dourado Premium
            .setThumbnail(message.client.user.displayAvatarURL())
            .addFields(
                { 
                    name: '💼 TRABALHOS, CRIMES & RPG', 
                    value: '`k trabalhar` - Escolha sua profissão.\n`k executar` - Trabalha e ganha dinheiro.\n`k batercarteira` - Roubo rápido de pedestres.\n`k roubar @user` - Assalta a carteira de um jogador.\n`k habilidades` - Aprimore sua Sorte e Lábia na árvore de talentos.\n`k cd` - Veja seus tempos de descanso (cooldown).', 
                    inline: false 
                },
                { 
                    name: '🏦 GESTÃO FINANCEIRA', 
                    value: '`k perfil` - Seu cartão de visitas, habilidades e saldo.\n`k dep [valor]` / `k depall` - Guarda na conta bancária.\n`k sacar [valor]` - Tira dinheiro do banco.\n`k pix @user [valor]` - Transfere dinheiro com comprovativo bancário.\n`k extrato` - Histórico oficial das suas transações.\n`k rank` / `k top` - Os 10 magnatas mais ricos.', 
                    inline: false 
                },
                { 
                    name: '🛒 ITENS & IMPÉRIO', 
                    value: '`k loja` - Compre vantagens (Colete, Pé de Cabra, etc).\n`k comprar [item]` - Adquire um item da loja.\n`k usar` - Abre seu inventário para ativar itens.\n`k mercado` - Compre empresas exclusivas do sistema.\n`k empresas` - Gerencie lucros, falências ou venda negócios.\n`k mercadonegro` - Compre empresas inflacionadas de jogadores.', 
                    inline: false 
                },
                { 
                    name: '🎰 CASSINO & APOSTAS', 
                    value: '`k tigrinho` - Fortune Tiger Kibo HD! Rode as roletas e fature.\n`k mines [aposta] [minas]` - Encontre diamantes e fuja das bombas.\n`k crash [valor]` - Pare o multiplicador antes que o gráfico exploda.\n`k coinflip @user [valor]` - Aposte 50/50 na moeda contra outro jogador.', 
                    inline: false 
                },
                { 
                    name: '🎁 RECOMPENSAS & VIP', 
                    value: '`k daily` - Seu bônus diário em dinheiro.\n`k mensal` - Bônus gigantesco a cada 30 dias.\n`k c` - Mostra seu cartão de Kibo Cash.', 
                    inline: false 
                },
                { 
                    name: '🎭 INTERAÇÃO SOCIAL', 
                    value: '`k bio` - Altere a mensagem de status do seu perfil.\n`k abracar @user` - Dê um abraço apertado.\n`k beijar @user` - Roube um beijo.\n`k socar @user` - Dê um direto na cara.\n`k chutar @user` - Um bico ninja.\n`k morder @user` - Mordida feroz.\n`k dancar @user` - Passinho sincronizado.', 
                    inline: false 
                }
            )
            .setFooter({ text: 'Kibo Engine • Desenvolvido para Magnatas', iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};