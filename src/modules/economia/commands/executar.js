import { prisma } from '../../../core/database.js';

// 👑 SEU ID AQUI (O dono do morro não pega cooldown em nada)
const DEV_ID = '1070658145740926987'; 

export default {
    name: 'executar',
    execute: async (message) => {
        const userId = message.author.id;

        const userDb = await prisma.user.findUnique({ where: { userId } });
        const job = userDb?.currentJob || 'desempregado';

        if (job === 'desempregado') {
            return message.reply('❌ Você é um desempregado, mano! Dá um pulo na agência com `k trabalhar` antes de querer meter a mão na massa.');
        }

        // --- HABILIDADES (Sorte = mais lucro, Agilidade = menos cooldown, Inteligência = bônus hacker) ---
        const skills = typeof userDb.skills === 'string' ? JSON.parse(userDb.skills) : (userDb.skills || {});
        const sorteLvl = skills.sorte || 1;
        const agilidadeLvl = skills.agilidade || 1;
        const inteligenciaLvl = skills.inteligencia || 1;

        const bonusSorte = sorteLvl * 0.05; // +5% de lucro por nível
        const bonusAgilidade = agilidadeLvl * 0.04; // -4% de cooldown por nível
        const bonusInteligencia = inteligenciaLvl * 0.07; // +7% de lucro hacker por nível

        // --- SISTEMA DE COOLDOWN (DEV = 0 / VIP = 5 min / Normal = 10 min) ---
        const isDev = userId === DEV_ID;
        const isVip = userDb.isPremium;
        const cooldownMinutes = Math.max(1, Math.round((isVip ? 5 : 10) * (1 - bonusAgilidade)));

        if (!isDev) {
            const cooldownDb = await prisma.cooldown.findUnique({ where: { userId_command: { userId, command: 'executar' } } });
            
            if (cooldownDb && cooldownDb.expiresAt > new Date()) {
                const minutos = Math.ceil((cooldownDb.expiresAt - new Date()) / 60000);
                
                const cdMsgs = [
                    `⏳ Segura a emoção, chefe! Você já suou a camisa. Descansa aí por mais **${minutos} minutos**.`,
                    `⏳ Vai devagar, truta! O trampo cansa. Volta daqui a **${minutos} minutos**.`,
                    `⏳ Cê tá na correria, mas o corpo pede arrego. Mofa aí por **${minutos} minutos** antes de trampar de novo.`
                ];
                return message.reply(cdMsgs[Math.floor(Math.random() * cdMsgs.length)]);
            }

            const nextTime = new Date(Date.now() + cooldownMinutes * 60 * 1000);
            await prisma.cooldown.upsert({
                where: { userId_command: { userId, command: 'executar' } },
                update: { expiresAt: nextTime },
                create: { userId, command: 'executar', expiresAt: nextTime }
            });
        }

        // --- CONFIGURAÇÃO DAS PROFISSÕES (Novo Sistema) ---
        // Risco: Chance em % de dar errado e o cara perder grana.
        const jobConfig = {
            cidadao: { lucroMin: 1000, lucroMax: 3000, risco: 0 }, // Honesto nunca se ferra
            ladrao: { lucroMin: 3000, lucroMax: 7000, risco: 30 },
            hacker: { lucroMin: 4000, lucroMax: 9000, risco: 35 },
            policial: { lucroMin: 2000, lucroMax: 5000, risco: 15 } // Patrulha de rua
        };

        const config = jobConfig[job];
        
        // Se der algum bug e o emprego for inválido
        if (!config) {
            return message.reply('❌ Deu B.O no seu contrato! Usa o `k trabalhar` de novo pra assinar os papéis certos na prefeitura.');
        }

        const chance = Math.random() * 100;
        const lucro = Math.floor(Math.random() * (config.lucroMax - config.lucroMin + 1)) + config.lucroMin;

        // 🍀 Sorte aumenta o lucro base em 5% por nível
        let finalLucro = Math.floor(lucro * (1 + bonusSorte));

        // 🧠 Inteligência turbina o trabalho de Hacker em 7% por nível
        if (job === 'hacker') {
            finalLucro = Math.floor(finalLucro * (1 + bonusInteligencia));
        }

        // --- FALHA (Deu ruim no trampo) ---
        if (chance < config.risco) {
            const multa = Math.floor(lucro / 2); // Perde metade do que ganharia
            
            await prisma.user.update({
                where: { userId },
                data: { balance: { decrement: multa > userDb.balance ? userDb.balance : multa } } // Proteção pra não ficar negativo
            });

            let falhaMsg = '';
            if (job === 'ladrao') {
                const frases = [
                    `🚨 Deu ruim! Você tentou passar a mão na bolsa da madame, mas tomou bolsada e deixou cair **$${multa}** na fuga.`,
                    `🚨 A casa caiu! O dono do mercadinho tava com um pedaço de pau. Você correu e perdeu **$${multa}** no caminho.`
                ];
                falhaMsg = frases[Math.floor(Math.random() * frases.length)];
            } else if (job === 'hacker') {
                const frases = [
                    `💻 Tela Azul! O firewall rastreou seu IP. Pra apagar os rastros, você torrou **$${multa}** com servidores proxy.`,
                    `💻 Queimou tudo! O PC deu curto-circuito na hora de quebrar a senha. Prejuízo de **$${multa}** na Santa Ifigênia.`
                ];
                falhaMsg = frases[Math.floor(Math.random() * frases.length)];
            } else if (job === 'policial') {
                const frases = [
                    `🚑 Tiroteio na esquina! A patrulha foi tensa, você tomou um tiro de raspão no colete. Gastou **$${multa}** na farmácia!`,
                    `🚑 Bateu a viatura! Na perseguição você subiu no canteiro da avenida. A prefeitura descontou **$${multa}** do seu salário.`
                ];
                falhaMsg = frases[Math.floor(Math.random() * frases.length)];
            }

            return message.reply(`💥 **TRAMPO DEU RUIM!**\n\n${falhaMsg}`);
        }

        // --- SUCESSO (Trampo perfeito) ---
        await prisma.user.update({
            where: { userId },
            data: { balance: { increment: finalLucro } }
        });

        let sucessoMsg = '';
        if (job === 'cidadao') {
            const frases = [
                `👷 Bateu o ponto, truta! Um dia de trampo honesto que rendeu **$${finalLucro.toLocaleString('pt-BR')}** limpos.`,
                `👷 Suou a camisa no canteiro de obras e o patrão liberou **$${finalLucro.toLocaleString('pt-BR')}** na sua mão.`,
                `👷 Organizou o estoque da loja e foi pro abraço. Pagamento do dia: **$${finalLucro.toLocaleString('pt-BR')}**.`
            ];
            sucessoMsg = frases[Math.floor(Math.random() * frases.length)];
        } else if (job === 'ladrao') {
            const frases = [
                `🥷 Bote perfeito! Passou a mão no celular do boyzinho e vendeu no beco por **$${finalLucro.toLocaleString('pt-BR')}**.`,
                `🥷 Mão leve demais! Limpou o caixa da farmácia e meteu o pé com **$${finalLucro.toLocaleString('pt-BR')}** no bolso.`,
                `🥷 Desmanche rendeu! Trouxe as peças daquela moto e os caras te soltaram **$${finalLucro.toLocaleString('pt-BR')}**.`
            ];
            sucessoMsg = frases[Math.floor(Math.random() * frases.length)];
        } else if (job === 'hacker') {
            const frases = [
                `💻 Script rodou liso! Você drenou umas contas esquecidas e puxou **$${finalLucro.toLocaleString('pt-BR')}** em cripto.`,
                `💻 Hackeou o banco de dados da prefeitura e vendeu as infos por **$${finalLucro.toLocaleString('pt-BR')}** na Deep Web.`,
                `💻 Invasão concluída! Clonou uns cartões na gringa e sacou **$${finalLucro.toLocaleString('pt-BR')}**.`
            ];
            sucessoMsg = frases[Math.floor(Math.random() * frases.length)];
        } else if (job === 'policial') {
            const frases = [
                `🚓 Patrulha tranquila! Manteve a quebrada em ordem e a prefeitura te pagou **$${finalLucro.toLocaleString('pt-BR')}**.`,
                `🚓 Resolveu o B.O dos vizinhos encrenqueiros e assinou o relatório. Salário do dia: **$${finalLucro.toLocaleString('pt-BR')}**.`,
                `🚓 Dia de ronda, aplicou umas multas e engordou a conta em **$${finalLucro.toLocaleString('pt-BR')}**.`
            ];
            sucessoMsg = frases[Math.floor(Math.random() * frases.length)];
        }

        let skillsMsg = `\n*🍀 A sua **Sorte (Nível ${sorteLvl})** garantiu +${(bonusSorte * 100).toFixed(0)}% no pagamento!*`;
        if (job === 'hacker') skillsMsg += `\n*🧠 A sua **Inteligência (Nível ${inteligenciaLvl})** decifrou sistemas e rendeu +${(bonusInteligencia * 100).toFixed(0)}% extra!*`;

        return message.reply(`✅ **TRAMPO CONCLUÍDO!**\n\n${sucessoMsg}${skillsMsg}`);
    }
};