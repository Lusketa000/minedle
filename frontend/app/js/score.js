async function loadLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;

    container.innerHTML = '<div class="text-green-500 animate-pulse text-center font-mono">&gt; FETCHING_HIGH_SCORES...</div>';

    try {
        const response = await fetch('http://localhost/api/score');
        if (!response.ok) throw new Error('SERVER_ERROR');

        const scores = await response.json();
        renderLeaderboard(scores);
    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="text-red-500 text-center font-mono">&gt; ERROR: UNABLE_TO_LOAD_LEADERBOARD</div>';
    }
}

function renderLeaderboard(scores) {
    const container = document.getElementById('leaderboard-container');

    if (!scores || scores.length === 0) {
        container.innerHTML = '<div class="text-green-700 text-center font-mono">&gt; NO_SCORES_RECORDED_YET</div>';
        return;
    }

    let html = `
        <table class="w-full text-center border-collapse font-mono text-xs">
            <thead>
                <tr class="border-b border-green-500/50 text-green-400">
                    <th class="py-2 px-2">RANK</th>
                    <th class="py-2 px-2">PLAYER</th>
                    <th class="py-2 px-2">DIFFICULTY</th>
                    <th class="py-2 px-2">TIME</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-green-900/40">
    `;

    scores.forEach((item, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? 'text-green-300 font-bold' : 'text-green-500';
        
        const timeInSeconds = parseFloat(item.tempoGasto || item.tempo_gasto || 0);
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const rawDiff = item.dificuldade || item.difficulty;
        const difficulty = rawDiff ? String(rawDiff).toUpperCase() : 'EASY';

        html += `
            <tr class="hover:bg-green-500/10 transition-colors ${rankClass}">
                <td class="py-2 px-2">#${String(rank).padStart(2, '0')}</td>
                <td class="py-2 px-2">${item.nome || 'ANONYMOUS'}</td>
                <td class="py-2 px-2 text-green-400/80 font-semibold">${difficulty}</td>
                <td class="py-2 px-2">${formattedTime}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}