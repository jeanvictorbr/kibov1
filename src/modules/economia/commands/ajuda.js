import { EmbedBuilder } from 'discord.js';

export default {
    name: 'ajuda',
    aliases: ['help', 'comandos'],
    execute: async (message) => {
        const embed = new EmbedBuilder()
            .setTitle('📖 MANUAL DO IMPÉRIO KIBO')
            .setDescription('Bem-vindo à central de ajuda, chefe! Aqui estão todos os comandos para você dominar a economia e o submundo do servidor.\n\n🚨 **TÁ PERDIDO NA CIDADE?**\nDigite **`k tutorial`** para abrir o **Guia Definitivo e Interativo** com a explicação completa de cada sistema, tempos de espera e chances de prisão!')
            .setColor('#FFD700') // Dourado Premium
            .setThumbnail(message.client.user.displayAvatarURL())
            .addFields(
                { 
                    name: '💹 KIBO EXCHANGE & CRYPTO (NOVO)', 
                    value: '`k crypto` - Abre o painel visual da bolsa de valores com gráficos e cofre.\n`k comprarcrypto <moeda> <qtd>` (ou `k cc`) - Compra criptomoedas com taxas de 2%.\n`k vendercrypto <moeda> <qtd|tudo>` (ou `k vc`) - Vende ativos e recebe via Pix.\n`k cryptotop` (ou `k ctop`) - Abre o Hall da Fama com as maiores Baleias do servidor.', 
                    inline: false 
                },
                { 
                    name: '🏴 FACÇÕES (NOVO)', 
                    value: '`k fac criar <nome>` - Funda sua facção (escolhe o ramo no menu).\n`k fac convidar @user` - Recruta (Líder/Capo).\n`k fac expulsar @user` - Manda rodar (Líder/Capo).\n`k fac promover @user` - Sobe pra Capo (só Líder).\n`k fac sair` / `k fac dissolver` - Vaza da fac ou acaba com ela.\n`k fac doar <valor>` - Bota grana no caixa da fac.\n`k fac banco` / `k fac estoque` - Veja o caixa e as mercadorias.\n`k fac pegar <item> <qtd>` - Líder/Capo tira item do estoque pro inventário (usa com `k usar`).\n`k fac vender <item> <qtd> <preco>` / `k fac mercado` - Venda e compre mercadoria entre facções.\n`k fac perfil` / `k fac top` - Perfil em imagem e ranking da cidade.\n`k fac guerra @membro [valor]` - Declara guerra de facção! Quem mais roubar, leva o pote (mín. $20k).\n`k fac guerra` - Veja o placar da guerra.', 
                    inline: false 
                },
                { 
                    name: '💊 TRABALHO DE FACÇÃO (NOVO)', 
                    value: '`k operacao` - Execute a missão do ramo, encha o caixa e produza itens (10 min).\n`k farmar` - (Tráfico) Cuida do plantio e colhe mercadoria (5 min).\n`k desmanchar` - (Armas) Moí carro roubado em peças (5 min).\n`k caixinha` - (Lavagem) Gira a contabilidade de fachada (5 min).\n`k botnet` - (Hacking) Aluga sua rede de zumbis (5 min).\n`k entregar` - (Transporte) Corre carga entre distritos (5 min).\n`k registradora` - Estoura o caixa da loja 24h e atiça a ROTA (15 min).\n`k arrastao` - Arrastão na praça central, o butim é sujo (20 min).', 
                    inline: false 
                },
                { 
                    name: '💼 TRABALHOS & RPG', 
                    value: '`k trabalhar` - Escolha sua profissão (Cidadão, Ladrão, Hacker, Polícia, Médico, Advogado, Segurança, Sequestrador ou Contrabandista).\n`k executar` - Trabalha e ganha dinheiro.\n`k tratar @ferido [valor]` - Médico cura feridos de assalto.\n`k advogar @preso [valor]` - Advogado reduz a pena de quem tá na cadeia (Lábia ajuda!).\n`k segurar @cliente [valor]` - Segurança blinda o cliente contra roubo por 30 min.\n`k sequestrar @rico` - Sequestrador cobra resgate na mão grande (vítima precisa ter $30k+).\n`k contrabandear` - Contrabandista atravessa carga suja na fronteira.\n`k batercarteira` - Roubo rápido de pedestres.\n`k roubar @user` - Assalta a carteira de um jogador.\n`k habilidades` - Aprimore suas 6 habilidades na árvore de talentos.\n`k cd` - Veja seus tempos de descanso (cooldown).', 
                    inline: false 
                },
                { 
                    name: '🔫 POLÍCIA & LADRÃO', 
                    value: '`k contratar @user` - (Delegado) Entrega o distintivo de PM. Só assim alguém vira Oficial.\n`k prender @user` - Dá um enquadro num criminoso (Requer ser PM). Apreende metade da grana suja!\n`k revistar @user` - PM revira o bolso do cidadão atrás de grana suja (Requer ser PM, 10 min).\n`k assaltar_caixa` - Tenta estourar um caixa (Requer Ladrão).\n`k carroforte` - Inicia o grande roubo ao Carro Forte (Requer C4).\n`k lavar [valor] [@lavador]` - Lava sua grana suja (com facção de Lavagem é mais barato!).\n`k fuga` - Tenta serrar as grades de Alcatraz.\n`k subornar @PM [valor]` - Oferece grana pro PM pra sair da cadeia.', 
                    inline: false 
                },
                { 
                    name: '🏦 GESTÃO FINANCEIRA', 
                    value: '`k perfil` - Seu cartão de visitas, habilidades e saldo.\n`k dep [valor]` / `k depall` - Guarda na conta bancária.\n`k sacar [valor]` - Tira dinheiro do banco.\n`k pix @user [valor]` - Transfere dinheiro com comprovativo bancário.\n`k extrato` - Histórico oficial das suas transações.\n`k rank` / `k top` - Os 10 magnatas mais ricos.', 
                    inline: false 
                },
                { 
                    name: '🛒 ITENS & IMPÉRIO', 
                    value: '`k loja` - Compre vantagens legais.\n`k mercadonegro` - Itens restritos (ex: C4) e empresas de jogadores.\n`k comprar [item]` - Adquire um item da loja ou beco.\n`k usar` - Abre seu inventário para ativar itens.\n`k empresas` - Gerencie lucros e venda negócios.\n`k mercado` - Mercado livre de itens entre jogadores.', 
                    inline: false 
                },
                { 
                    name: '🎰 CASSINO & APOSTAS', 
                    value: '`k tigrinho [valor]` - Fortune Tiger Kibo HD.\n`k mines [aposta] [minas]` - Encontre diamantes.\n`k crash [valor]` - Pare o multiplicador antes que exploda.\n`k coinflip @user [valor]` - Cara ou coroa contra outro jogador.', 
                    inline: false 
                },
                { 
                    name: '🎁 RECOMPENSAS & VIP', 
                    value: '`k daily` - Seu bônus diário em dinheiro.\n`k mensal` - Bônus gigantesco a cada 30 dias.\n`k c` - Mostra seu cartão de Kibo Cash.', 
                    inline: false 
                },
                { 
                    name: '🎭 INTERAÇÃO SOCIAL', 
                    value: '`k bio [texto]` - Altere a mensagem de status do seu perfil.\n`k abracar`, `k socar`, `k chutar`, `k morder`, `k dancar` @user.', 
                    inline: false 
                }
            )
            .setFooter({ text: 'Kibo Engine • Desenvolvido para Magnatas', iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};