// js/components/calendar.js

document.addEventListener('DOMContentLoaded', function () {
    const calendar = document.getElementById('calendar');
    if (!calendar) return; // Falls Element nicht existiert (z.B. auf Settings-Seite)

    const days = [];
    const today = new Date();

    // Calculate start of week (Monday)
    // Day 0 is Sunday, 1 is Monday... so if today is Sunday (0), we go back 6 days. 
    // If today is Monday (1), we go back 0 days.
    const currentDay = today.getDay(); // 0-6
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - distanceToMonday);

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);

        const isToday = d.toDateString() === today.toDateString();

        days.push({
            day: i === 6 ? 'S' : dayNames[d.getDay()], // Force 'S' for Sunday (index 0) is confusing with dayNames array logic, let's just use dayNames
            dayLetter: dayNames[d.getDay()], // S, M, T, W...
            date: d.getDate(),
            today: isToday
        });
    }

    days.forEach(d => {
        const pill = document.createElement('div');
        pill.className = `day-pill ${d.today ? 'active today' : ''}`;
        pill.innerHTML = `
            <span class="day-letter">${d.dayLetter}</span>
            <span class="day-number">${d.date}</span>
        `;

        pill.addEventListener('click', function () {
            // Alle inaktiv
            document.querySelectorAll('.day-pill').forEach(p => {
                p.classList.remove('active', 'today'); // Keep 'today' class if it IS today? Logic in original was removing everything.
                // Original logic: removed 'active' and 'today'. 
                // We should probably keep 'today' visual distinction if intended, but let's stick to simple "active" state selection.
                // Re-adding 'active' to clicked one.
            });

            // Restore 'today' class for the actual today element if we want to keep it highlighted differently,
            // but for now let's just follow the selection logic.
            // Actually, usually 'today' is a permanent marker. Let's fix the class cleanup.

            document.querySelectorAll('.day-pill').forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            // Haptic Feedback
            if (navigator.vibrate) navigator.vibrate(10);
        });

        calendar.appendChild(pill);
    });
});