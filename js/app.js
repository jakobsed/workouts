// Tab Switching
// Navigation zwischen Views
function switchTab(element, tabName) {
    // Alle Tabs inaktiv
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.remove('active');
    });
    element.classList.add('active');

    // Views umschalten
    const workoutView = document.getElementById('workout-view');
    const settingsView = document.getElementById('settings-view');
    const headerTitle = document.querySelector('.header-title');

    if (tabName === 'workout') {
        workoutView.classList.add('active');
        settingsView.classList.remove('active');
        if (headerTitle) headerTitle.textContent = 'Workout';
    } else if (tabName === 'more') {
        workoutView.classList.remove('active');
        settingsView.classList.add('active');
        if (headerTitle) headerTitle.textContent = 'More';
    } else {
        // Dashboard, Levels - zur Zeit nur Alert oder später implementieren
        alert(tabName + ' kommt bald!');
    }

    if (navigator.vibrate) navigator.vibrate(10);
}


// Add Sheet Modal
function openAddSheet() {
    const backdrop = document.getElementById('modalBackdrop');
    const sheet = document.getElementById('addSheet');

    backdrop.classList.add('active');
    sheet.classList.add('active');
    document.body.classList.add('modal-open');

    if (navigator.vibrate) navigator.vibrate(15);
}

function closeAddSheet() {
    const backdrop = document.getElementById('modalBackdrop');
    const sheet = document.getElementById('addSheet');

    backdrop.classList.remove('active');
    sheet.classList.remove('active');
    document.body.classList.remove('modal-open');
}

function selectOption(option) {
    console.log('Ausgewählt:', option);
    closeAddSheet();
    if (navigator.vibrate) navigator.vibrate(20);
    alert(`"${option}" wurde ausgewählt!`);
}

// Swipe to dismiss für das Sheet
let touchStartY = 0;
const sheet = document.getElementById('addSheet');

sheet.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
});

sheet.addEventListener('touchend', e => {
    const touchEndY = e.changedTouches[0].screenY;
    if (touchEndY - touchStartY > 100) { // Nach unten gewischt
        closeAddSheet();
    }
});