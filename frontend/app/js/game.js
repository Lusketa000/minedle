let board = [];
let rows, cols;

async function startNewGame(difficulty) {
    const boardContainer = document.getElementById('board');
    //boardContainer.innerHTML = '<span class= "text-green-500 font-mono">Loading...</span>';
    
    const response = await fetch(`http://localhost:8080/api/board?difficulty=${difficulty}`);
    board = await response.json();

    rows = board.length
    cols = board[0].length

    renderBoard();
}

function renderBoard() {
    const boardContainer = document.getElementById('board');
    boardContainer.innerHTML = '';

    boardContainer.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            
            cell.className = 'w-8 h-8 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors duration-200 border border-green-800/50 bg-green-700/20 hover:bg-green-600/40';
            
            cell.addEventListener('click', () => {
                if (board[i][j] === 1) {
                    cell.classList.replace('bg-green-700/20', 'bg-red-600');
                    cell.classList.remove('hover:bg-green-600/40');
                    cell.innerText = '💣';
                } else {
                    cell.classList.replace('bg-green-700/20', 'bg-green-500/65');
                    cell.classList.remove('hover:bg-green-600/40');
                }
            });

            boardContainer.appendChild(cell);
        }
    }
}

function selectDifficulty(difficulty) {
    document.querySelectorAll('.easy-button, .medium-button, .hard-button')
        .forEach(button => button.classList.remove('bg-green-500', 'text-black'));

    document.querySelector(`.${difficulty}-button`)
        .classList.add('bg-green-500', 'text-black');

    startNewGame(difficulty);
}