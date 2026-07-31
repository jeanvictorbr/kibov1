import { prisma } from '../../../core/database.js';
import { getActiveBuffEffects, hasActiveCooldown } from '../../../utils/buffService.js';

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
        const labiaLvl = skills.labia || 1;
        const forcaLvl = skills.forca || 1;

        const bonusSorte = sorteLvl * 0.05; // +5% de lucro por nível
        const bonusAgilidade = agilidadeLvl * 0.04; // -4% de cooldown por nível
        const bonusInteligencia = inteligenciaLvl * 0.07; // +7% de lucro hacker por nível
        const bonusLabia = labiaLvl * 0.05; // +5% de lucro advogado por nível
        const bonusForca = forcaLvl * 0.05; // +5% de lucro segurança por nível

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
            policial: { lucroMin: 2000, lucroMax: 5000, risco: 15 }, // Patrulha de rua
            medico: { lucroMin: 2000, lucroMax: 4500, risco: 10 }, // Plantão no hospital público
            advogado: { lucroMin: 2500, lucroMax: 5500, risco: 10 }, // Consultas e audiências
            seguranca: { lucroMin: 3000, lucroMax: 6000, risco: 20 }, // Escolta de alto risco
            sequestrador: { lucroMin: 3500, lucroMax: 7000, risco: 35 }, // Extorsão de pequeno porte
            contrabandista: { lucroMin: 4000, lucroMax: 8000, risco: 30 } // Mercadoria na fronteira
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

        // 🧠 Inteligência ajuda o Médico a prescrever tratamento caro
        if (job === 'medico') {
            finalLucro = Math.floor(finalLucro * (1 + bonusInteligencia));
        }

        // 🗣️ Lábia turbina o Advogado (mais causas ganhas)
        if (job === 'advogado') {
            finalLucro = Math.floor(finalLucro * (1 + bonusLabia));
        }

        // 💪 Força turbina o Segurança Privado (escolta mais pesada)
        if (job === 'seguranca') {
            finalLucro = Math.floor(finalLucro * (1 + bonusForca));
        }

        // 💪 Força turbina o Sequestrador (arrastar a vítima pro cativeiro)
        if (job === 'sequestrador') {
            finalLucro = Math.floor(finalLucro * (1 + bonusForca));
        }

        // 🧠 Inteligência turbina o Contrabandista (conhece a rota certa)
        if (job === 'contrabandista') {
            finalLucro = Math.floor(finalLucro * (1 + bonusInteligencia));
        }

        // 🌿💉 Buff de droga (item): +25%/+50% de lucro enquanto ativa
        const buffEffects = await getActiveBuffEffects(userId);
        if (buffEffects.lucro > 0) {
            finalLucro = Math.floor(finalLucro * (1 + buffEffects.lucro));
        }

        // 🤕 Ferido trampa mancando: -50% no rendimento
        let feridoMsg = '';
        if (await hasActiveCooldown(userId, 'ferido')) {
            finalLucro = Math.floor(finalLucro * 0.5);
            feridoMsg = '\n🤕 *Você tá **ferido**! Rendimento caiu pela metade. Procura um Médico (`k tratar @medico`).*';
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
            } else if (job === 'medico') {
                const frases = [
                    `🩺 Plantão caótico! Chegou uma ocorrência de tiro cruzado e a prefeitura te culpou pela demora. Descontou **$${multa}** do salário.`,
                    `🩺 Processo na porta! Um paciente alegou erro médico. O CRM te suspendeu por um dia e você perdeu **$${multa}**.`
                ];
                falhaMsg = frases[Math.floor(Math.random() * frases.length)];
            } else if (job === 'advogado') {
                const frases = [
                    `⚖️ Causa perdida! O juiz não aceitou sua argumentação e o cliente se recusou a pagar. Prejuízo de **$${multa}** no escritório.`,
                    `⚖️ Audiência atrasada! O trânsito te comeu e o juiz te multou por desacato. Gastou **$${multa}** pra limpar a ficha.`
                ];
                falhaMsg = frases[Math.floor(Math.random() * frases.length)];
            } else if (job === 'seguranca') {
                const frases = [
                    `👮 Escolta deu errado! Tomou uma tocaia no meio do caminho e o cliente arrancou sua cabeça. Teve que pagar **$${multa}** pelos danos.`,
                    `👮 Assalto na sua guarda! O cliente foi rendido mesmo com sua proteção e você perdeu **$${multa}** indenizando ele.`
                ];
                falhaMsg = frases[Math.floor(Math.random() * frases.length)];
            } else if (job === 'sequestrador') {
                const frases = [
                    `🧨 Resgate furado! A família da vítima desconfiou e chamou a ROTA. Pra sumir do cerco, você torrou **$${multa}** com fuga de helicóptero.`,
                    `🧨 Cativeiro vazou! O sequestrado escapou pela janela e ainda te quebrou no pau. Perdeu **$${multa}** tentando comprar o silêncio do caseiro.`
                ];
                falhaMsg = frases[Math.floor(Math.random() * frases.length)];
            } else if (job === 'contrabandista') {
                const frases = [
                    `📦 Fronteira fechada! A fiscal apreendeu a carga e você pagou **$${multa}** de propina pra não ir junto no camburão.`,
                    `📦 Barco afundou! A mercadoria molhou na travessia do rio e o prejuízo foi de **$${multa}**. A polícia fluvial quase te pegou.`
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
        } else if (job === 'medico') {
            const frases = [
                `🩺 Plantão cheio! Costurou um maluco que caiu do muro e cobrou **$${finalLucro.toLocaleString('pt-BR')}** pelo atendimento.`,
                `🩺 Cirurgia top! Recolocou um braço no lugar e a família te pagou **$${finalLucro.toLocaleString('pt-BR')}** no pix.`,
                `🩺 Atendeu a quebrada toda no posto e o plantão rendeu **$${finalLucro.toLocaleString('pt-BR')}** de caixinha.`
            ];
            sucessoMsg = frases[Math.floor(Math.random() * frases.length)];
        } else if (job === 'advogado') {
            const frases = [
                `⚖️ Causa ganha! Tirou o cliente da cadeia com um habeas corpus rápido e recebeu **$${finalLucro.toLocaleString('pt-BR')}** de honorários.`,
                `⚖️ Acordo fechado! Resolveu a briga dos irmãos e a parte te pagou **$${finalLucro.toLocaleString('pt-BR')}** de consulta.`,
                `⚖️ Tribunal lotado! Defendeu um patrão do crime e o cachê foi **$${finalLucro.toLocaleString('pt-BR')}**.`
            ];
            sucessoMsg = frases[Math.floor(Math.random() * frases.length)];
        } else if (job === 'seguranca') {
            const frases = [
                `👮 Escolta concluída! Protegeu o dono do cassino até o destino e recebeu **$${finalLucro.toLocaleString('pt-BR')}** de cachê.`,
                `👮 Blindagem no rolê! Nem o morro tremeu na sua guarda. Pagamento do dia: **$${finalLucro.toLocaleString('pt-BR')}**.`,
                `👮 Vigia de shopping! Impediu dois arrastões e o gerente te premiou com **$${finalLucro.toLocaleString('pt-BR')}**.`
            ];
            sucessoMsg = frases[Math.floor(Math.random() * frases.length)];
        } else if (job === 'sequestrador') {
            const frases = [
                `🧨 Pequena extorsão fechada! Segurou um playboy no cativeiro um dia e a família pagou **$${finalLucro.toLocaleString('pt-BR')}** de "despesas".`,
                `🧨 Sequestro relâmpago! Pegou um coroa na saída do banco e soltou ele por **$${finalLucro.toLocaleString('pt-BR')}** de resgate rápido.`,
                `🧨 Refém liberado (vivo)! O pagamento de **$${finalLucro.toLocaleString('pt-BR')}** caiu na conta e você queimou a máscara depois de longe.`
            ];
            sucessoMsg = frases[Math.floor(Math.random() * frases.length)];
        } else if (job === 'contrabandista') {
            const frases = [
                `📦 Carga atravessada! O contrabando de cigarros passou pela fronteira e rendeu **$${finalLucro.toLocaleString('pt-BR')}**.`,
                `📦 Rota limpa! Chegou no porto com os eletrônicos sem fiscal ver. Lucro: **$${finalLucro.toLocaleString('pt-BR')}**.`,
                `📦 Mercadoria na mão do cliente! O esquema de contrabando de hoje rendeu **$${finalLucro.toLocaleString('pt-BR')}** pro teu bolso.`
            ];
            sucessoMsg = frases[Math.floor(Math.random() * frases.length)];
        }

        let skillsMsg = `\n*🍀 A sua **Sorte (Nível ${sorteLvl})** garantiu +${(bonusSorte * 100).toFixed(0)}% no pagamento!*`;
        if (job === 'hacker') skillsMsg += `\n*🧠 A sua **Inteligência (Nível ${inteligenciaLvl})** decifrou sistemas e rendeu +${(bonusInteligencia * 100).toFixed(0)}% extra!*`;
        if (job === 'medico') skillsMsg += `\n*🧠 A sua **Inteligência (Nível ${inteligenciaLvl})** prescreveu tratamentos caros e rendeu +${(bonusInteligencia * 100).toFixed(0)}%!*`;
        if (job === 'advogado') skillsMsg += `\n*🗣️ A sua **Lábia (Nível ${labiaLvl})** convenceu mais clientes e rendeu +${(bonusLabia * 100).toFixed(0)}%!*`;
        if (job === 'seguranca') skillsMsg += `\n*💪 A sua **Força (Nível ${forcaLvl})** impôs respeito na escolta e rendeu +${(bonusForca * 100).toFixed(0)}%!*`;
        if (job === 'sequestrador') skillsMsg += `\n*💪 A sua **Força (Nível ${forcaLvl})** arrastou a vítima sem fazer escândalo e rendeu +${(bonusForca * 100).toFixed(0)}%!*`;
        if (job === 'contrabandista') skillsMsg += `\n*🧠 A sua **Inteligência (Nível ${inteligenciaLvl})** achou a rota sem fiscal e rendeu +${(bonusInteligencia * 100).toFixed(0)}%!*`;
        if (buffEffects.lucro > 0) skillsMsg += `\n*🌿 O efeito da droga turbinou seu rendimento em +${(buffEffects.lucro * 100).toFixed(0)}%!*`;

        return message.reply(`✅ **TRAMPO CONCLUÍDO!**\n\n${sucessoMsg}${feridoMsg}${skillsMsg}`);
    }
};