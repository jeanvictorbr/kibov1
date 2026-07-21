export default {
    name: 'crash',
    execute: async (message, args) => {
        return message.reply({
            content: `# 🛑 FOGUETE EM MANUTENÇÃO!\n> Salve chefe! O **Crash** precisou ser desativado temporariamente para uma manutenção de emergência (a perícia encontrou uma brecha de lavagem de dinheiro no sistema 🕵️‍♂️).\n>\n> Fica tranquilo! Nossos mecânicos já estão trabalhando para blindar o código e logo o foguete volta a voar com segurança. 🚀🔧\n\n*Aproveite para focar nos roubos e nos trabalhos enquanto isso!*`
        });
    }
};