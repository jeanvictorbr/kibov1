import ajuda from './ajuda.js';

export default {
    name: 'help',
    execute: async (message, args, client, reply, targetUser) => {
        // Redireciona tudo para o comando 'ajuda'
        return ajuda.execute(message, args, client, reply, targetUser);
    }
};