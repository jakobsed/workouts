/**
 * Add Sheet (Shortcuts Modal) JavaScript
 * Handles opening, closing, and option selection
 */

function openAddSheet() {
    const backdrop = document.getElementById('modalBackdrop');
    const sheet = document.getElementById('addSheet');

    if (backdrop && sheet) {
        backdrop.classList.add('active');
        sheet.classList.add('active');
        document.body.classList.add('modal-open');

        if (navigator.vibrate) navigator.vibrate(15);
    }
}

function closeAddSheet() {
    const backdrop = document.getElementById('modalBackdrop');
    const sheet = document.getElementById('addSheet');

    if (backdrop && sheet) {
        backdrop.classList.remove('active');
        sheet.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

function selectOption(option) {
    closeAddSheet();
    if (navigator.vibrate) navigator.vibrate(20);

    switch (option) {
        case 'empty-workout':
            // Start empty workout immediately
            window.location.href = 'active-workout.html';
            break;
        case 'new-program':
            // Create new program (coming soon)
            alert('New Program - Coming soon!');
            break;
        case 'new-workout':
            // Create new workout template
            window.location.href = 'create-workout.html';
            break;
        default:
            console.log('Unknown option:', option);
    }
}

// Swipe to dismiss
document.addEventListener('DOMContentLoaded', () => {
    const sheetEl = document.getElementById('addSheet');
    let touchStartY = 0;

    if (sheetEl) {
        sheetEl.addEventListener('touchstart', e => {
            touchStartY = e.changedTouches[0].screenY;
        });

        sheetEl.addEventListener('touchend', e => {
            const touchEndY = e.changedTouches[0].screenY;
            if (touchEndY - touchStartY > 100) {
                closeAddSheet();
            }
        });
    }
});