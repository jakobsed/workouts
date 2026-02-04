document.addEventListener('DOMContentLoaded', () => {
    setCurrentDate();
    // In future: loadDashboardData();
});

function setCurrentDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        // German locale as requested in screenshot "MITTWOCH, 4. FEBRUAR"
        let dateString = now.toLocaleDateString('de-DE', options);
        dateEl.textContent = dateString.toUpperCase();
    }
}

function toggleFilter(filterType) {
    const options = document.querySelectorAll('.toggle-option');
    options.forEach(opt => opt.classList.remove('active-option'));

    // Simple toggle logic for visual feedback
    if (filterType === 'active-program') {
        options[0].classList.add('active-option');
        // Filter logic here
    } else {
        options[1].classList.add('active-option');
        // Filter logic here
    }
}
