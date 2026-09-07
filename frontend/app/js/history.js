function renderHistoryView() {
    const historyContainer = document.getElementById('history-list');
    if (!historyContainer) return;

    const DAYS_TO_SHOW = 30;
    const historyData = [];
    const today = new Date();

    for (let i = 0; i < DAYS_TO_SHOW; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);

        // Formato ISO local para YYYY-MM-DD sem problemas de fuso horário
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        const isoDate = `${year}-${month}-${day}`;
        const formattedDate = `${day}/${month}/${year}`;

        historyData.push({
            rawDate: isoDate,
            displayDate: formattedDate,
            isToday: i === 0
        });
    }

    historyContainer.innerHTML = historyData.map(item => {
        const label = item.isToday ? ' <span class="text-green-300 text-xs">(TODAY)</span>' : '';

        return `
            <div onclick="loadBoardByDate('${item.rawDate}')" 
                 class="border border-green-500/40 bg-black/60 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-green-400 hover:bg-green-950/30 cursor-pointer transition-colors">
                
                <div class="space-y-1 font-mono pointer-events-none">
                    <div class="text-green-400 font-bold text-sm tracking-wide">
                        &gt; DATE: ${item.displayDate}${label}
                    </div>
                </div>

                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button onclick="event.stopPropagation(); loadBoardByDate('${item.rawDate}')" 
                            class="flex-1 md:flex-none px-3 py-1 text-xs font-mono text-green-500 transition whitespace-nowrap">
                        &gt; PLAY
                    </button>
                </div>
            </div>
        `;
    }).join('');
}