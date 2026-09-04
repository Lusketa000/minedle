const VIEWS = ['view-menu', 'view-game', 'view-history', 'view-leaderboard'];

function navigateTo(viewId) {
    VIEWS.forEach(id => {
        const view = document.getElementById(id);
        if (!view) return;

        if (id === viewId) {
            view.classList.remove("hidden");
        } else {
            view.classList.add("hidden");
        }
    });
    
    if (viewId === 'view-menu' && typeof typeWriter === 'function') {
        typeWriter('ascii-title-menu', ASCII_ART.menu, 'menu-buttons');
    }

    if (viewId === 'view-history') {
        const btnContainer = document.getElementById('history-buttons');
        if (btnContainer) {
            btnContainer.classList.remove('opacity-0');
        }

        if (typeof renderHistoryView === 'function') {
            renderHistoryView();
        }

        if (typeof typeWriter === 'function') {
            typeWriter('ascii-title-history', ASCII_ART.history, 'history-buttons');
        }
    }

    if (viewId === 'view-leaderboard') {
        if (typeof loadLeaderboard === 'function') loadLeaderboard();
        if (typeof typeWriter === 'function') {
            typeWriter('ascii-title-leaderboard', ASCII_ART.leaderboard, 'leaderboard-buttons');
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    typeWriter('ascii-title-menu', ASCII_ART.menu, 'menu-buttons');
});