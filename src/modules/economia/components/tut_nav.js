export default {
    customId: 'tut_nav',
    execute: async (interaction) => {
        const escolha = interaction.values[0];
        let texto = '';

        if (escolha === 'banco') {
            texto = `💰 **ECONOMIA E BANCO**\n\n` +
            `Dinheiro na mão é vendaval, na rua ladrão rouba. Cuida da sua grana:\n\n` +
            `**1. Dinheiro Grátis:** Usa \`k daily\` todo dia e \`k mensal\` todo mês pra pegar o auxílio da prefeitura.\n` +
            `**2. Segurança:** Usa \`k depositar [valor]\` ou \`k depall\` pra guardar na conta do banco. Pra tirar, usa \`k sacar [valor]\`.\n` +
            `**3. Pagar os Parceiros:** Comprou alguma fita de alguém? Usa \`k pix @user [valor]\` pra transferir.\n` +
            `**4. Seu Extrato:** Quer ver pra onde sua grana foi? Digita \`k extrato\`.\n` +
            `**5. Os Mais Ricos:** Usa \`k rank\` ou \`k top\` pra ver quem são os magnatas e bilionários do servidor.`;
        } 
        else if (escolha === 'trampos') {
            texto = `🏢 **EMPREGOS E TRAMPOS (\`k trabalhar\`)**\n\n` +
            `Ninguém vive de vento. Você precisa assinar a carteira no submundo:\n\n` +
            `**1. As Profissões:**\n` +
            `- 👷 **Cidadão Honesto:** Trabalha tranquilo. Dinheiro limpo e sem risco.\n` +
            `- 🥷 **Ladrão de Rua:** Bate carteira. Lucro alto, mas pode perder grana fugindo.\n` +
            `- 💻 **Hacker:** Invade contas pelo PC. Lucro monstro, mas alto risco.\n` +
            `- 🚓 **Polícia:** Caça criminoso na rua. *(Exige distintivo dado pelo Delegado)*.\n\n` +
            `**2. Fazendo a Boa (\`k executar\`):**\n` +
            `Usa o \`k executar\` a cada 10 min (5m pra VIP) pra farmar dinheiro baseado na sua profissão. Fica ligeiro que ladrão e hacker podem se dar mal e tomar prejuízo no processo!`;
        } 
        else if (escolha === 'guerra') {
            texto = `🔫 **A GUERRA DE RUA (Polícia vs Ladrão)**\n\n` +
            `Se você escolheu o crime ou a farda, aqui as regras são pesadas:\n\n` +
            `🧨 **Assalto (\`k assaltar_caixa\`):** Ladrão tenta estourar o banco. O alarme toca pra PM, que tem 2 minutos pra clicar em IMPEDIR. Se a PM clicar, rola tiro (50% do ladrão fugir rico, 50% de ir em cana).\n\n` +
            `🚨 **Enquadro (\`k prender @suspeito\`):** O PM tenta prender ladrões na rua. Tem 60% de chance. Se prender, o PM rouba 10% da carteira do cara e joga ele em Alcatraz por 30 mins.\n\n` +
            `🔒 **Estou Preso, e agora?**\n` +
            `- **\`k fuga\`**: Tenta escapar (30% de chance). Se falhar, toma mais +15 min!\n` +
            `- **\`k subornar @PM [valor]\`**: Oferece propina. Se o PM pegar o dinheiro, você tá livre. Se ele recusar, a punição aumenta!`;
        }
        else if (escolha === 'cassino') {
            texto = `🎰 **CASSINO CLANDESTINO E APOSTAS**\n\n` +
            `Tá com sorte ou com vício? Multiplica (ou perde tudo) com esses jogos:\n\n` +
            `- **\`k tigrinho [valor]\`**: Jogo das maquininhas. Gira a roleta e reza pra vir as letras iguais. Tem bônus de 10x o valor da aposta!\n` +
            `- **\`k crash [valor]\`**: O gráfico vai subindo e multiplicando sua grana. Clica no botão de Parar antes que exploda (CRASH), senão perde tudo.\n` +
            `- **\`k mines [valor]\`**: Campo minado! Clica nos botões pra pegar dinheiro, mas se pisar na bomba, já era.\n` +
            `- **\`k coinflip [valor]\`**: O famoso cara ou coroa contra o sistema (50/50).\n` +
            `- **\`k airdrop\`**: Fica de olho no chat! Quando a caixa cair, o primeiro que clicar e apostar ganha recompensa forte.`;
        }
        else if (escolha === 'lojas') {
            texto = `🛒 **LOJAS, EMPRESAS E MERCADO**\n\n` +
            `Faça o dinheiro trabalhar por você ou compre melhorias pro seu perfil:\n\n` +
            `- **\`k empresas\`**: Compre um negócio (Ex: Lava-jato, Cassino, etc.). Elas geram dinheiro passivo pra você coletar com o tempo!\n` +
            `- **\`k loja\`**: Onde você compra itens normais pra usar na cidade.\n` +
            `- **\`k mercadonegro\`**: Loja escondida com itens ilegais e buffados.\n` +
            `- **\`k mercado\`**: Mercado entre jogadores. Vende seus itens pros outros manos.\n` +
            `- **\`k comprar [item]\`** e **\`k usar [item]\`**: Gerencia seu inventário.`;
        }
        else if (escolha === 'social') {
            texto = `🫂 **PERFIL E SISTEMA SOCIAL**\n\n` +
            `O respeito na rua e o seu histórico na cidade:\n\n` +
            `- **\`k perfil\`**: Mostra sua identidade, emprego, grana e stats gerais.\n` +
            `- **\`k bio [texto]\`**: Escreve a sua história pra todo mundo ver no seu perfil.\n` +
            `- **\`k habilidades\`**: Veja o nível das suas skills e status de progressão.\n\n` +
            `🗯️ **Ações na Quebrada:**\n` +
            `Manda um salve pra galera com os comandos: \`k beijar @user\`, \`k abracar @user\`, \`k socar @user\`, \`k chutar @user\`, \`k morder @user\`. O bot responde de acordo com a resenha.`;
        }
        else if (escolha === 'vip') {
            texto = `💎 **VANTAGENS VIP**\n\n` +
            `Os playboys e donos de negócio que assinam o VIP têm prioridade na cidade e cortam fila na prefeitura:\n\n` +
            `⚡ **Trampo Acelerado:**\n` +
            `- O tempo de espera do \`k executar\` cai pela metade (De 10 para apenas 5 minutos).\n\n` +
            `🧨 **Crime Profissional:**\n` +
            `- Ladrões VIPs têm experiência. O tempo de planejamento de um novo \`k assaltar_caixa\` cai de 20 minutos para absurdos **5 minutos**.\n\n` +
            `Quer ser VIP e amassar a concorrência? Dá um salve no dono do servidor e pega a visão de como apoiar o projeto!`;
        }

        // Atualiza a própria mensagem mantendo o menu lá embaixo
        await interaction.update({ content: texto, components: [interaction.message.components[0]] });
    }
};