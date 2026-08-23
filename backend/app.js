// Importa o Fastify
const fastify = require('fastify')();


// Rotas
fastify.get('/', async (request, reply) => {
    return { message: 'Backend rodando...' };
});


// Conecta o servidor na porta 8000
fastify.listen({ port: 8000, host: '0.0.0.0' }, (err) => {
    if (err) throw err;
});