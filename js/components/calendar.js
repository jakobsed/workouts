// js/components/calendar.js

document.addEventListener('DOMContentLoaded', function () {
    const calendar = document.getElementById('calendar');
    if (!calendar) return; // Falls Element nicht existiert (z.B. auf Settings-Seite)

    const days = [
        { day: 'M', date: 26 },
        { day: 'T', date: 27 },
        { day: 'W', date: 28, today: true },
        { day: 'T', date: 29 },
        { day: 'F', date: 30 },
        { day: 'S', date: 31 },
        { day: 'S', date: 1 }
    ];

    days.forEach(d => {
        const pill = document.createElement('div');
        pill.className = `day-pill ${d.today ? 'active today' : ''}`;
        pill.innerHTML = `
            <span class="day-letter">${d.day}</span>
            <span class="day-number">${d.date}</span>
        `;

        pill.addEventListener('click', function () {
            // Alle inaktiv
            document.querySelectorAll('.day-pill').forEach(p => {
                p.classList.remove('active', 'today');
            });
            // Diesen aktiv
            this.classList.add('active', 'today');

            // Haptic Feedback
            if (navigator.vibrate) navigator.vibrate(10);
        });

        calendar.appendChild(pill);
    });
});