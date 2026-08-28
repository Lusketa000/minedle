const VIEWS = ['view-menu', 'view-game', 'view-history']

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

    if (viewId === 'view-history' && typeof typeWriter === 'function') {
        typeWriter('ascii-title-history', ASCII_ART.history, 'history-buttons');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    typeWriter('ascii-title-menu', ASCII_ART.menu, 'menu-buttons');
});