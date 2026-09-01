const GAME_STATE = {
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
    WON: 'WON',
    LOST: 'LOST'
};

let gameState = GAME_STATE.IDLE;
let board = [];
let rows, cols;
let startTime;
let timerInterval = null;
let finalTime = 0;

// Função para iniciar um novo jogo com base na dificuldade escolhida
async function startNewGame(difficulty) {    
    const boardContainer = document.getElementById('board');
    stopTimer();
    updateTimerDisplay(0);
    gameState = GAME_STATE.IDLE;

    const scoreBox = document.getElementById('score-box');
    if (scoreBox) scoreBox.classList.add('hidden')

    const response = await fetch(`http://localhost:8080/api/board?difficulty=${difficulty}`);
    const data = await response.json();

    rows = data.length
    cols = data[0].length

    board = data.map(row => 
        row.map(cellValue => ({
            isMine: cellValue === 1,
            revealed: false,
        }))
    );
    
    renderBoard();
}

// Função para lidar com a seleção de dificuldade
function selectDifficulty(difficulty) {
    document.querySelectorAll('.easy-button, .medium-button, .hard-button')
        .forEach(button => {
            button.classList.remove('bg-green-500', 'text-black');
            button.classList.add('text-green-500');
        });
    
    const selectedButton = document.querySelector(`.${difficulty}-button`);
    if (selectedButton) {
        selectedButton.classList.add('bg-green-500', 'text-black');
        selectedButton.classList.remove('text-green-500');
    }
    
    startNewGame(difficulty);
}





// Função para iniciar o timer do jogo
function startTimer() {
    timerInterval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        updateTimerDisplay(seconds);
    }, 1000);
}

// Função para parar o timer do jogo
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Função para atualizar o display do timer
function updateTimerDisplay(seconds) {
    const timerElement = document.getElementById('game-timer');
    if (timerElement) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        timerElement.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}





// Função para renderizar o tabuleiro do jogo
function renderBoard() {
    const boardContainer = document.getElementById('board');
    boardContainer.innerHTML = '';
    boardContainer.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cellData = board[i][j];
            const cell = document.createElement('div');
            
            cell.className = 'w-8 h-8 flex items-center justify-center font-bold text-sm select-none border border-green-800/50 transition-colors duration-200';            
            
            if (cellData.revealed) {
                if (cellData.isMine) {
                    cell.className+= ' bg-red-600 text-white';
                    cell.innerText = '💣';
                } else {
                    cell.className+= ' bg-green-900/60 text-green-300';
                }
            } else {
                cell.className += ' bg-green-700/20 hover:bg-green-600/40 cursor-pointer';
                cell.addEventListener('click', () => cellClickHandler(i, j));
            }

            boardContainer.appendChild(cell);
        }
    }
}

// Função para lidar com o clique em uma célula do tabuleiro
function cellClickHandler(i, j) {
    if (gameState === GAME_STATE.IDLE) {
        gameState = GAME_STATE.RUNNING;
        startTime = Date.now();
        startTimer();
    }

    if (gameState !== GAME_STATE.RUNNING) return;
    
    const cell = board[i][j];
    if (cell.revealed) return;

    cell.revealed = true;

    if (cell.isMine) {
        // Para testes, por enquanto o jogador ganha se a célula for uma mina (trocar para false depois)
        endGame(true);
    } else {
        // TODO: Implementar lógica para contar minas e revelar celulas adjacentes
    }

    renderBoard();
}





// Função para salvar o score
async function saveScore(name, time) {
    const response = await fetch('http://localhost:8080/api/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nome: name, tempo_gasto: time
        })
    });

    const data = await response.json();
}


// Função para enviar o score
async function sendScore() {
    const input = document.getElementById('player-name');
    const nome = input.value.trim() || 'ANONYMOUS';

    document.getElementById('score-box').classList.add('hidden');
    input.value = '';

    await saveScore(nome, finalTime);
}

// Função para finalizar o jogo
function endGame(isVictory) {
    stopTimer();
    finalTime = Math.min(Math.floor((Date.now() - startTime) / 1000), 999.99);
    if (!isVictory) {
        gameState = GAME_STATE.LOST;
        return
    }

    gameState = GAME_STATE.WON;

    const scoreBox = document.getElementById('score-box');
    if (scoreBox) {
        scoreBox.classList.remove('hidden');
        document.getElementById('player-name').focus();
    }
} 