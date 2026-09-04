const fastify = require('fastify')({logger: true});

fastify.register(require('@fastify/mysql'), {
  promise: true,
  connectionString: 'mysql://app_user:senha123@10.20.30.4:3306/app_db'
})

// Rotas
fastify.get('/api/board', async (request, reply) => {
    const difficulty = request.query.difficulty;

    try {
        const today = new Date().toISOString().split('T')[0];

        const [seeds] = await fastify.mysql.query('SELECT seed FROM tabuleiros WHERE dia = ?', [today]);
        
        if (seeds.length === 0) {
            const newSeed = Math.floor(Math.random() * 1000000);
            await fastify.mysql.query('INSERT INTO tabuleiros (dia, seed) VALUES (?, ?)', [today, newSeed]);
            seeds.push({ seed: newSeed });
        }
        const seed = seeds[0].seed;
        
        console.log(`Using seed: ${seed}`);
        console.log(`Using difficulty: ${difficulty}`);
        const board = generateBoard(seed, difficulty);

        return board;
    } catch (err) {
        console.error(err);
        reply.code(500).send({ error: 'Database query failed' })
    }
});

fastify.get('/api/board/:date', async (request, reply) => {
    const date = request.params.date;
    const difficulty = request.query.difficulty;

    try {
        const day = date;

        const [seeds] = await fastify.mysql.query('SELECT seed FROM tabuleiros WHERE dia = ?', [day]);
        
        if (seeds.length === 0) {
            const newSeed = Math.floor(Math.random() * 1000000);
            await fastify.mysql.query('INSERT INTO tabuleiros (dia, seed) VALUES (?, ?)', [day, newSeed]);
            seeds.push({ seed: newSeed });
        }
        const seed = seeds[0].seed;
        
        console.log(`Using seed: ${seed}`);
        console.log(`Using difficulty: ${difficulty}`);
        const board = generateBoard(seed, difficulty);

        return board;
    } catch (err) {
        console.error(err);
        reply.code(500).send({ error: 'Database query failed' })
    }

});

fastify.get('/api/score', async (request, reply) => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const [tabuleiros] = await fastify.mysql.query('SELECT id FROM tabuleiros WHERE dia = ?', [today]);
        if (tabuleiros.length === 0) {
            return reply.code(400).send({ error: 'No board for today' });
        }
        const tabuleiro_id = tabuleiros[0].id;

        const [scores] = await fastify.mysql.query('SELECT * FROM placares WHERE tabuleiros_id = ? ORDER BY tempo_gasto ASC LIMIT 10', [tabuleiro_id]);
        return scores;
    } catch (err) {
        console.error(err);
        reply.code(500).send({ error: 'Database query failed' })
    }
});

fastify.post('/api/score', async (request, reply) => {
    const { nome, tempo_gasto } = request.body;
    try {
        const today = new Date().toISOString().split('T')[0];

        const [tabuleiros] = await fastify.mysql.query('SELECT id FROM tabuleiros WHERE dia = ?', [today]);
        console.log(`Tabuleiros for today: ${JSON.stringify(tabuleiros)}`);
        if (tabuleiros.length === 0) {
            return reply.code(400).send({ error: 'No board for today' });
        }
        const tabuleiro_id = tabuleiros[0].id;

        await fastify.mysql.query('INSERT INTO placares (nome, tempo_gasto, tabuleiros_id) VALUES (?, ?, ?)', [nome, tempo_gasto, tabuleiro_id]);
        return { message: 'Score submitted successfully' };
    } catch (err) {
        console.error(err);
        reply.code(500).send({ error: 'Database query failed' })
    }
});

function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

function generateBoard(seed, difficulty) {
    let rows, cols, mines;
    switch (difficulty) {
        case 'easy':
            rows = 9;
            cols = 9;
            mines = 10;
            break;
        case 'medium':
            rows = 16;
            cols = 16;
            mines = 40;
            break;
        case 'hard':
            rows = 16;
            cols = 30;
            mines = 99;
            break;
        default:
            rows = 9;
            cols = 9;
            mines = 10;
    }

    const random = mulberry32(seed);

    const board = Array.from(
        { length: rows },
        () => Array(cols).fill(0)
    );

    let placed = 0;
    
    
    while (placed < mines) {
        const row = Math.floor(random() * rows);
        const col = Math.floor(random() * cols);
        //console.log(`Placing mine at (${row}, ${col})`);
        
        if (board[row][col] !== 1) {
            board[row][col] = 1;
            placed++;
        }
    }

    return board;
}

// Conecta o servidor na porta 8000
fastify.listen({ port: 8000, host: '0.0.0.0' }, (err) => {
    if (err) throw err;
});