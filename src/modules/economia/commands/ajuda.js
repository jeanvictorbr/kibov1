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
                    name: '💼 TRABALHOS & CRIMES', 
                    value: '`k trabalhar` - Escolha sua profissão.\n`k executar` - Trabalha e ganha dinheiro.\n`k batercarteira` - Roubo rápido de pedestres.\n`k roubar @user` - Assalta a carteira de um jogador.\n`k cd` - Veja seus tempos de descanso (cooldown).', 
                    inline: false 
                },
                { 
                    name: '🏦 GESTÃO FINANCEIRA', 
                    value: '`k perfil` - Seu cartão de visitas, skills e saldo.\n`k dep [valor]` / `depall` - Guarda na conta bancária.\n`k sacar [valor]` - Tira dinheiro do banco.\n`k pix @user [valor]` - Transfere dinheiro eletronicamente.\n`k extrato` - Histórico das suas transações.\n`k rank` / `k top` - Os 10 magnatas mais ricos.', 
                    inline: false 
                },
                { 
                    name: '🛒 ITENS & IMPÉRIO', 
                    value: '`k loja` - Compre vantagens (Colete, Pé de Cabra, etc).\n`k comprar [item]` - Adquire um item da loja.\n`k usar` - Abre seu inventário para ativar itens.\n`k mercado` - Compre empresas exclusivas do sistema.\n`k empresas` - Gerencie lucros, falências ou venda negócios.\n`k mercadonegro` - Compre empresas inflacionadas de jogadores.', 
                    inline: false 
                },
                { 
                    name: '🎁 RECOMPENSAS & VIP', 
                    value: '`k daily` - Seu bônus diário em dinheiro.\n`k mensal` - Bônus gigantesco a cada 30 dias.\n`k c` - Mostra seu cartão de Kibo Cash.', 
                    inline: false 
                },
                { 
                    name: '🎰 CASSINO CLANDESTINO', 
                    value: '`k crash [valor]` - Jogo de risco! Pare o multiplicador antes que exploda e multiplique seu dinheiro.', 
                    inline: false 
                },
                { 
                    name: '🎭 INTERAÇÃO SOCIAL', 
                    value: '`k abracar @user` - Dê um abraço apertado.\n`k beijar @user` - Roube um beijo.\n`k socar @user` - Dê um direto na cara.\n`k chutar @user` - Um bico ninja.\n`k morder @user` - Mordida feroz.\n`k dancar @user` - Passinho sincronizado.', 
                    inline: false 
                }
            )
            .setFooter({ text: 'Kibo Engine • Desenvolvido para Magnatas', iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};