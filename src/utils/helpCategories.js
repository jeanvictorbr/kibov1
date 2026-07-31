import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

// Todas as categorias do manual do Kibo
export const HELP_CATEGORIES = [
    {
        id: 'faccoes',
        emoji: '🏴',
        title: 'FACÇÕES',
        menuDesc: 'Criação, membros, economia, mercado, guerra e perfil',
        desc: 'Cria tua facção e domina o submundo da cidade! Cada ramo tem sua missão, seus buffs e uma mercadoria exclusiva.',
        overview: '`k fac criar <nome>` - Funda tua fac e escolhe o ramo.\n`k fac convidar @user` - Recruta (Líder/Capo).\n`k fac expulsar @user` - Manda rodar.\n`k fac promover @user` - Sobe pra Capo.\n`k fac sair` / `k fac dissolver` - Vaza ou acaba com ela.\n`k fac doar <valor>` - Bota grana no caixa.\n`k fac banco` / `k fac estoque` - Confere contas.\n`k fac pegar <item> <qtd>` - Retira item do estoque pro inventário.\n`k fac vender <item> <qtd> <preco>` / `k fac mercado` - Vende e compra mercadoria.\n`k fac perfil` / `k fac top` - Perfil em imagem e ranking.\n`k fac guerra @membro [valor]` - Declara guerra; `k fac guerra` - placar.',
        fields: [
            { name: '📦 Comando Base', value: '`k fac` - Lista os comandos de facção.\n`k fac criar <nome>` - Funda a fac e escolhe o ramo no menu (Tráfico, Armas, Lavagem, Hacking, Transporte).\n`k fac perfil [@user]` - Perfil completo em IMAGEM.\n`k fac top` - Ranking das facções da cidade.' },
            { name: '👥 Membros', value: '`k fac convidar @user` - Recruta (Líder/Capo).\n`k fac expulsar @user` - Manda rodar (Líder/Capo).\n`k fac promover @user` - Sobe pra Capo (só Líder).\n`k fac sair` - Vaza da fac.\n`k fac dissolver` - Acaba com a fac (só Líder).\n\n👑 Líder manda em tudo. ⭐ Capo convida/expulsa. 🔫 Membro opera.' },
            { name: '💰 Economia', value: '`k fac doar <valor>` - Bota grana no caixa.\n`k fac banco` - Confere o caixa.\n`k fac estoque` - Confere as mercadorias produzidas.\n`k fac pegar <item> <qtd>` - Líder/Capo retira item do estoque pro próprio inventário (ativa com `k usar`).' },
            { name: '🛒 Mercado de Facções', value: '`k fac vender <item> <qtd> <preco>` - Anuncia item da fac pra cidade (Líder/Capo).\n`k fac mercado` - Compra itens anunciados por outras facções.\n\n🧪 Os itens dão buffs: drogas (+lucro), armas (+chance de assalto), Conta de Lavagem (taxa cortada), Script de Invasão (+XP), Mapa de Rotas (+influência).' },
            { name: '⚔️ Guerra', value: '`k fac guerra @membro [valor]` - Declara guerra (aposta mín. $20k, padrão $50k, sai do caixa).\n`k fac guerra` - Placar e resolução.\n\nDura 60 min. Quem roubar membro da fac inimiga marca ponto. O vencedor leva o POTE (2x aposta) + 100 XP + 5 de influência.' }
        ]
    },
    {
        id: 'facjobs',
        emoji: '💊',
        title: 'TRABALHO DE FACÇÃO',
        menuDesc: 'Operação, mini-jobs e crimes de rua',
        desc: 'Comandos pra manter tua fac na ativa o dia inteiro. Mini-jobs com cooldown pequeno e crimes que rendem grana suja (e atiçam a ROTA).',
        overview: '`k operacao` - Missão do ramo (4 min).\n`k farmar` - (Tráfico) Plantio (4 min).\n`k desmanchar` - (Armas) Carro moído (4 min).\n`k caixinha` - (Lavagem) Contabilidade (4 min).\n`k botnet` - (Hacking) Rede de zumbis (4 min).\n`k entregar` - (Transporte) Entrega de carga (4 min).\n`k registradora` - Estoura caixa da loja 24h (15 min).\n`k arrastao` - Arrastão na praça (20 min).',
        fields: [
            { name: '🎯 Missão Principal (4 min)', value: '`k operacao` - Executa a missão do ramo: lucro pra você, grana pro caixa da fac, XP, influência e a mercadoria exclusiva pro estoque.' },
            { name: '⚡ Mini-Jobs (4 min)', value: 'Cada ramo tem o seu. Todo mini-job dá lucro, parte pro caixa, XP/influência e chance de produzir item:\n`k farmar` - (💊 Tráfico) Cuida do plantio.\n`k desmanchar` - (🔫 Armas) Moí carro roubado em peças.\n`k caixinha` - (💵 Lavagem) Gira a contabilidade de fachada.\n`k botnet` - (💻 Hacking) Aluga sua rede de zumbis.\n`k entregar` - (🚚 Transporte) Corre carga entre distritos.' },
            { name: '🥷 Crimes de Rua', value: '`k registradora` - Estoura o caixa da loja 24h, até $20k (15 min).\n`k arrastao` - Arrastão na praça central, até $30k (20 min).\n\n⚠️ O butim é GRANA SUJA (80-90%) e a ROTA da PM recebe o alerta: qualquer Oficial pode te interceptar em 60s. Se for pego: 1h de Alcatraz + metade da grana suja apreendida!' }
        ]
    },
    {
        id: 'jobs',
        emoji: '💼',
        title: 'TRABALHOS & SERVIÇOS',
        menuDesc: 'Profissões, executar e os serviços entre players',
        desc: 'Escolhe tua profissão e presta serviço pros outros players por grana.',
        overview: '`k trabalhar` - Escolhe a profissão.\n`k executar` - Trabalha (10 min).\n`k tratar @ferido [valor]` - Médico cura.\n`k advogar @preso [valor]` - Advogado reduz pena.\n`k segurar @cliente [valor]` - Segurança blinda.\n`k sequestrar @rico` - Sequestrador cobra resgate.\n`k contrabandear` - Contrabandista cruza a fronteira.\n`k contratar @user` - Delegado entrega o distintivo.\n`k habilidades` - Árvore de skills.\n`k cd` - Cooldowns.',
        fields: [
            { name: '💼 Profissões', value: '`k trabalhar` - Cidadão, Ladrão, Hacker, Polícia, Médico, Advogado, Segurança, Sequestrador ou Contrabandista.\n`k executar` - Trabalha e ganha teu dinheiro (10 min; 5 min VIP).\n`k habilidades` - Aprimora Sorte, Força, Lábia, Inteligência, Agilidade e Intimidação.' },
            { name: '🧑‍⚕️ Serviços de Player', value: '`k tratar @ferido [valor]` - Médico zera o ferimento do ferido.\n`k advogar @preso [valor]` - Advogado reduz a pena do preso (Lábia ajuda!).\n`k segurar @cliente [valor]` - Segurança blinda o cliente contra roubo por 30 min.\n`k sequestrar @rico` - Sequestrador cobra resgate (vítima com $30k+).\n`k contrabandear` - Contrabandista atravessa carga suja (15 min).\n`k contratar @user` - (Delegado) entrega o distintivo de PM.' },
            { name: '📊 Extras', value: '`k cd` - Painel visual dos seus cooldowns.\n`k tutorial` - Guia interativo completo com cada sistema explicado.' }
        ]
    },
    {
        id: 'police',
        emoji: '🔫',
        title: 'POLÍCIA & CRIME',
        menuDesc: 'Enquadro, revistada, roubo, caixa, carroforte e lavagem',
        desc: 'O duelo eterno entre a lei e o crime. PM caça grana suja, ladrão corre pro abraço.',
        overview: '`k prender @user` - Enquadra criminoso (PM).\n`k revistar @user` - Revira o bolso atrás de suja (PM).\n`k roubar @user` - Assalta jogador.\n`k batercarteira` - Roubo rápido.\n`k assaltar_caixa` - Estoura caixa (Ladrão).\n`k carroforte` - Roubo ao Carro Forte (Requer C4).\n`k lavar [valor] [@lavador]` - Lava grana suja.\n`k fuga` - Foge de Alcatraz.\n`k subornar @PM [valor]` - Compra tua liberdade.',
        fields: [
            { name: '🚓 Polícia', value: '`k prender @user` - Enquadra Ladrão ou Hacker (60% de sucesso). Prende por 1h e apreende metade da grana suja dele.\n`k revistar @user` - PM revira o bolso atrás de grana suja (10 min).\n`k contratar @user` - O Delegado é quem entrega o distintivo!' },
            { name: '🥷 Crime', value: '`k roubar @user` - Assalta a carteira de um jogador.\n`k batercarteira` - Roubo rápido de pedestres.\n`k assaltar_caixa` - Estoura um caixa, leva $50k-$150k (Requer Ladrão).\n`k carroforte` - O grande roubo ao Carro Forte, prêmio de $500k-$1.5M (Requer C4 do Mercado Negro).' },
            { name: '🧼 Sobrevivência', value: '`k lavar [valor] [@lavador]` - Lava grana suja (taxa 40% no NPC; com fac de Lavagem fica 15%).\n`k fuga` - 30% de chance de escapar de Alcatraz (se falhar, +15 min).\n`k subornar @PM [valor]` - Oferece propina pra sair da cadeia (se recusar, ganha pena).' }
        ]
    },
    {
        id: 'crypto',
        emoji: '💹',
        title: 'CRYPTO',
        menuDesc: 'Bolsa de valores, compra e venda de cripto',
        desc: 'Multiplica tua grana no day trade da Deep Web.',
        overview: '`k crypto` - Painel visual da bolsa.\n`k cc <moeda> <qtd>` (comprarcrypto) - Compra cripto.\n`k vc <moeda> <qtd|tudo>` (vendercrypto) - Vende no Pix.\n`k ctop` (cryptotop) - Hall da Fama das baleias.',
        fields: [
            { name: '💹 Kibo Exchange', value: '`k crypto` - Abre o terminal visual com gráficos e teu cofre.\n`k cc <moeda> <qtd>` - Compra criptomoedas (taxa 2%).\n`k vc <moeda> <qtd|tudo>` - Vende e recebe via Pix.\n`k ctop` - Pódio com as maiores Baleias.\n\nO mercado tem 9 moedas e os preços mudam a cada 10 minutos!' }
        ]
    },
    {
        id: 'finance',
        emoji: '🏦',
        title: 'FINANCEIRO',
        menuDesc: 'Perfil, banco, pix, extrato e ranking',
        desc: 'Cuida do teu malote como um magnata.',
        overview: '`k perfil` - Cartão de visitas.\n`k dep <valor>` / `k depall` - Guarda no banco.\n`k sacar <valor>` - Tira do banco.\n`k pix @user <valor>` - Transfere com comprovante.\n`k extrato` - Histórico de transações.\n`k rank` / `k top` - Os mais ricos.\n`k c` - Cartão de Kibo Cash.\n`k cd` - Cooldowns.',
        fields: [
            { name: '🏦 Gestão Financeira', value: '`k perfil` - Teu cartão de visitas (facção, habilidades e saldo).\n`k dep <valor>` / `k depall` - Guarda tua grana no banco (ladrão não pega!).\n`k sacar <valor>` - Puxa do banco pra mão.\n`k pix @user <valor>` - Transfere com comprovativo.\n`k extrato` - Histórico oficial das transações.\n`k rank` / `k top` - Os 10 magnatas mais ricos.\n`k c` - Teu cartão de Kibo Cash.\n`k cd` - Painel dos cooldowns.' }
        ]
    },
    {
        id: 'items',
        emoji: '🛒',
        title: 'ITENS & IMPÉRIO',
        menuDesc: 'Loja, mercado negro, inventário e empresas',
        desc: 'Compra, vende e usa os itens que fazem diferença na rua.',
        overview: '`k loja` - Vantagens legais.\n`k mercadonegro` - Itens restritos e empresas.\n`k comprar [item]` - Adquire um item.\n`k usar` - Abre o inventário.\n`k empresas` - Renda passiva.\n`k mercado` - Mercado livre de itens.',
        fields: [
            { name: '🛒 Itens & Império', value: '`k loja` - Compre vantagens legais.\n`k mercadonegro` - Itens restritos (ex: C4) e empresas de jogadores.\n`k comprar [item]` - Adquire um item da loja ou beco.\n`k usar` - Abre teu inventário e ativa itens (buffs de facção também!).\n`k empresas` - Gerencie lucros e venda negócios.\n`k mercado` - Mercado livre de itens entre jogadores.' }
        ]
    },
    {
        id: 'casino',
        emoji: '🎰',
        title: 'CASSINO & APOSTAS',
        menuDesc: 'Tigrinho, mines, crash, coinflip e airdrop',
        desc: 'Tá com sorte ou com vício? Multiplica (ou perde tudo) com os jogos da cidade.',
        overview: '`k tigrinho [valor]` - Fortune Tiger.\n`k mines [aposta] [minas]` - Campo minado.\n`k crash [valor]` - Multiplicador.\n`k coinflip @user [valor]` - Cara ou coroa.\n`k airdrop` - Caixa surpresa.',
        fields: [
            { name: '🎰 Cassino', value: '`k tigrinho [valor]` - Fortune Tiger Kibo HD.\n`k mines [aposta] [minas]` - Encontre diamantes sem pisar na bomba.\n`k crash [valor]` - Pare o multiplicador antes que exploda.\n`k coinflip @user [valor]` - Cara ou coroa contra outro jogador.\n`k airdrop` - Evento surpresa: a caixa cai do céu e o primeiro a clicar leva!' }
        ]
    },
    {
        id: 'rewards',
        emoji: '🎁',
        title: 'RECOMPENSAS & VIP',
        menuDesc: 'Daily, mensal e vantagens de quem apoia',
        desc: 'Grana de graça caindo do céu e regalias pra quem banca o server.',
        overview: '`k daily` - Bônus diário.\n`k mensal` - Bônus de 30 dias.\n`k airdrop` - Caixa surpresa.',
        fields: [
            { name: '🎁 Recompensas', value: '`k daily` - Teu bônus diário em dinheiro.\n`k mensal` - Bônus gigantesco a cada 30 dias.\n`k airdrop` - Evento surpresa com caixa caindo do céu.\n\n💎 **VIP:** cooldowns pela metade no `k executar`, `k assaltar_caixa` e `k carroforte`!' }
        ]
    },
    {
        id: 'social',
        emoji: '🎭',
        title: 'SOCIAL',
        menuDesc: 'Perfil, bio, tutorial e reações',
        desc: 'Deixa tua marca na quebrada e chama o parceiro pra resenha.',
        overview: '`k bio [texto]` - Teu status.\n`k tutorial` - Guia interativo.\n`k ajuda` / `k help` / `k comandos` - Manual.\n`k abracar`, `k socar`, `k chutar`, `k morder`, `k dancar`, `k beijar` @user.',
        fields: [
            { name: '🎭 Social', value: '`k bio [texto]` - Altera tua mensagem de status no perfil.\n`k tutorial` - Guia definitivo e interativo com cada sistema.\n`k ajuda` / `k help` / `k comandos` - Este manual.\n`k abracar @user` `k socar @user` `k chutar @user` `k morder @user` `k dancar @user` `k beijar @user` - Reações com gif.' }
        ]
    }
];

// Campos do embed de resumo (um por categoria)
export function overviewFields() {
    return HELP_CATEGORIES.map(c => ({
        name: `${c.emoji} ${c.title}`,
        value: c.overview,
        inline: false
    }));
}

// Menu de navegação de categorias (usa o mesmo customId do componente)
export function categorySelect(ownerId, placeholder) {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`ajuda_cat_${ownerId}`)
            .setPlaceholder(placeholder)
            .addOptions([
                { label: '📜 Ver tudo (resumo)', value: 'resumo', description: 'Volta pra lista geral de comandos' },
                ...HELP_CATEGORIES.map(c => ({
                    label: `${c.emoji} ${c.title}`,
                    value: c.id,
                    description: c.menuDesc
                }))
            ])
    );
}
