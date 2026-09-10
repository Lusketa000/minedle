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

let currentDate = null;
let currentDifficulty = 'easy';

// Função para iniciar um novo jogo com base na dificuldade escolhida
async function loadGame(date, difficulty) {   
    currentDate = date
    currentDifficulty = difficulty;
    
    const boardContainer = document.getElementById('board');
    stopTimer();
    updateTimerDisplay(0);
    gameState = GAME_STATE.IDLE;

    const scoreBox = document.getElementById('score-box');
    if (scoreBox) scoreBox.classList.add('hidden');

    const msgElement = document.getElementById('game-message');
    if (msgElement) {
        msgElement.innerText = '';
        msgElement.classList.add('hidden');
    }

    const url = currentDate
        ? `/api/board/${currentDate}?difficulty=${difficulty}`
        : `/api/board?difficulty=${difficulty}`;

    try {
        const response = await fetch(url);
        if(!response.ok) throw new Error('Falha ao obter o tabuleiro');

        const data = await response.json();

        rows = data.length;
        cols = data[0].length;

        board = data.map(row => 
            row.map(cellValue => ({
                isMine: cellValue === 1,
                revealed: false,
                neighborMines: 0,
                isFlagged: false
            }))
        );
        
        countNeighborMines(rows, cols, board);
        renderBoard();
    } catch (err) {
        console.error('Erro ao carregar o jogo:', err);
    }
}

// Função para carregar o tabuleiro da data escolhida no histórico
async function loadBoardByDate(dateString) {
    currentDate = dateString;
    if (typeof navigateTo === 'function') {
        navigateTo('view-game');
    }
    selectDifficulty('easy');
}

// Função para lidar com a seleção de dificuldade
function selectDifficulty(difficulty) {
    currentDifficulty = difficulty; 

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
    
    loadGame(currentDate, currentDifficulty);
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
                    cell.className += ' bg-red-600 text-white';
                    cell.innerText = '💣';
                } else {
                    cell.className += ' bg-green-900/60 text-green-300';
                }

                if (cellData.neighborMines > 0) {
                    cell.innerText = cellData.neighborMines;

                    const numberColors = ['', 'text-blue-400', 'text-green-400', 'text-red-400', 'text-purple-400', 'text-yellow-400'];
                    cell.className += ` ${numberColors[cellData.neighborMines] || 'text-pink-400'}`;
                }
            } else {
                cell.className += ' bg-green-700/20 hover:bg-green-600/40 cursor-pointer';

                if (cellData.isFlagged) {
                    cell.innerText = '🚩';
                }

                cell.addEventListener('mousedown', (event) => {
                    if (event.button === 0) {
                        cellClickHandler(i, j, 'left');
                    } else if (event.button === 2) {
                        cellClickHandler(i, j, 'right');
                    }
                });
                cell.addEventListener('contextmenu', (event) => event.preventDefault());
            }
            boardContainer.appendChild(cell);
        }
    }
}

// Função para lidar com o clique em uma célula do tabuleiro
function cellClickHandler(i, j, typeClick) {
    if (gameState === GAME_STATE.IDLE) {
        if (typeClick === 'right') return;
        gameState = GAME_STATE.RUNNING;
        startTime = Date.now();
        startTimer();
    }

    if (gameState !== GAME_STATE.RUNNING) return;
    
    const cell = board[i][j];
    if (cell.revealed) return;

    if (typeClick === 'right') {
        cell.isFlagged = !cell.isFlagged;
        renderBoard();
        return;
    }

    if (cell.isFlagged) return;

    cell.revealed = true;

    if (cell.isMine) {
        endGame(false);
    } else {
        revealAdjacentCells(i, j);
        const victory = board.every(row => row.every(c => c.isMine || c.revealed));
        if (victory) {
            endGame(true);
        }
    }

    renderBoard();
}

// Função para calcular o número de minas vizinhas
function countNeighborMines(rows, cols, board) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!board[i][j].isMine) {
                let mineCount = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        const row = i + x;
                        const col = j + y;

                        if (row >= 0 && row < rows && col >= 0 && col < cols) {
                            if (board[row][col].isMine) {
                                mineCount++;
                            }
                        }
                    }
                }
                board[i][j].neighborMines = mineCount;
            }
        }
    }
}

// Função para revelar células adjacentes
function revealAdjacentCells(i, j) {
    const cell = board[i][j];
    if (cell.neighborMines > 0) return;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            const row = i + x;
            const col = j + y;

            if (row >= 0 && row < rows && col >= 0 && col < cols) {
                const neighbor = board[row][col];

                if (!neighbor.revealed && !neighbor.isMine && !neighbor.isFlagged) {
                    neighbor.revealed = true;
                    revealAdjacentCells(row, col);
                }
            }
        }
    }
}





// Função para salvar o score
async function saveScore(name, time) {
    const response = await fetch('http://localhost/api/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nome: name, tempo_gasto: time, dificuldade: currentDifficulty
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

    const msgElement = document.getElementById('game-message');
    if (msgElement) {
        msgElement.innerText = '';
        msgElement.classList.add('hidden');
    }

    await saveScore(nome, finalTime);
}

// Função para finalizar o jogo
function endGame(isVictory) {
    stopTimer();
    finalTime = Math.min(Math.floor((Date.now() - startTime) / 1000), 999.99);

    const msgElement = document.getElementById('game-message');
    const scoreBox = document.getElementById('score-box');

    if (!isVictory) {
        gameState = GAME_STATE.LOST;

        if (msgElement) {
            msgElement.innerText = "Game Over! You hit a mine.";
            msgElement.className = "font-mono text-red-500 font-bold text-sm text-center";
            msgElement.classList.remove('hidden');
        }
        return;
    }

    gameState = GAME_STATE.WON;

    if (msgElement) {
        msgElement.innerText = `Congratulations! You won in ${String(Math.floor(finalTime / 60)).padStart(2, '0')}:${String(Math.floor(finalTime % 60)).padStart(2, '0')} minutes. Enter your name to save your score: `;
        msgElement.className = "font-mono text-green-400 font-bold text-xs text-center max-w-xs";
        msgElement.classList.remove('hidden');
    }

    if (scoreBox) {
        scoreBox.classList.remove('hidden');
        document.getElementById('player-name').focus();
    }
}