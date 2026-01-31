// Uhrzeit aktualisieren
function updateTime() {
    const clock = document.getElementById('clock');
    if (clock) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clock.textContent = `${hours}:${minutes}`;
    }
}

// Starten wenn DOM geladen
if (document.getElementById('clock')) {
    updateTime();
    setInterval(updateTime, 60000);
}

// Haptic Feedback Helper
function haptic(ms = 10) {
    if (navigator.vibrate) navigator.vibrate(ms);
}