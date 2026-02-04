document.addEventListener('DOMContentLoaded', () => {
    setCurrentDate();
    loadDashboardData();
});

function setCurrentDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        let dateString = now.toLocaleDateString('de-DE', options);
        dateEl.textContent = dateString.toUpperCase();
    }
}

function loadDashboardData() {
    const history = JSON.parse(localStorage.getItem('fitapp_workout_history') || '[]');

    updateWeeklyStats(history);
    updateWorkoutsInsight(history);
    updateVolumeInsight(history);
}

// ============================================
// WEEKLY STATS (Mondary - Sunday)
// ============================================

function updateWeeklyStats(history) {
    const now = new Date();
    // Calculate start of week (Monday)
    const dayRel = now.getDay() || 7; // 1 (Mon) - 7 (Sun)
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - dayRel + 1);

    // Filter workouts for this week
    const weeksWorkouts = history.filter(w => new Date(w.endedAt) >= monday);

    let totalSets = 0;
    const uniqueMuscles = new Set();
    const uniqueExercises = new Set();

    weeksWorkouts.forEach(workout => {
        workout.exercises.forEach(ex => {
            // Count sets
            const validSets = ex.sets.filter(s => s.completed && s.actualReps > 0).length;
            totalSets += validSets;

            // Track muscles/exercises if at least one set done
            if (validSets > 0) {
                uniqueMuscles.add(ex.muscleGroup);
                uniqueExercises.add(ex.name); // Using name as ID might be safer if IDs change, or use ex.id
            }
        });
    });

    // Update UI
    animateCounter('stat-muscles', uniqueMuscles.size);
    animateCounter('stat-sets', totalSets);
    animateCounter('stat-exercises', uniqueExercises.size);
}

// ============================================
// INSIGHTS
// ============================================

function updateWorkoutsInsight(history) {
    // Last 7 workouts for bar chart
    const recent = history.slice(0, 7).reverse(); // Oldest to newest
    const container = document.getElementById('workouts-chart');
    const metricEl = document.getElementById('workouts-metric');

    if (!container) return;

    // Data extraction (Sets per workout)
    const data = recent.map(w => {
        let sets = 0;
        w.exercises.forEach(ex => {
            sets += ex.sets.filter(s => s.completed).length;
        });
        return sets;
    });

    // Metric (Total sets last workout, or avg? Design implies latest value)
    // Let's show average or total for the period? 
    // Screenshot shows "2 sets" with an arrow. Likely "Latest workout sets".
    const latestSets = data.length > 0 ? data[data.length - 1] : 0;
    if (metricEl) {
        metricEl.innerHTML = `${latestSets} <span class="unit">sets</span>`;
    }

    // Render Bar Chart
    const max = Math.max(...data, 10); // Min max 10 to avoid full height on 1 set

    container.innerHTML = data.map((val, i) => {
        const height = (val / max) * 100;
        const isActive = i === data.length - 1; // Highlight latest
        return `<div class="bar ${isActive ? 'active-bar' : ''}" style="height: ${height}%;"></div>`;
    }).join('');

    // Fill missing bars if less than 7 for visual consistency? 
    // Or just align left/right. Flex space-between handles it.
    // If 0 workouts, show empty bars
    if (data.length === 0) {
        container.innerHTML = Array(7).fill(0).map(() =>
            `<div class="bar" style="height: 5%;"></div>`
        ).join('');
    }
}

function updateVolumeInsight(history) {
    // Last 7 workouts for Line Chart
    const recent = history.slice(0, 7).reverse();
    const container = document.getElementById('volume-chart');
    const metricEl = document.getElementById('volume-metric');

    if (!container) return;

    // Data extraction (Volume in kg)
    const data = recent.map(w => Math.round(w.totalVolume || 0));

    // Metric: Latest Volume
    const latestVolume = data.length > 0 ? data[data.length - 1] : 0;
    if (metricEl) {
        metricEl.innerHTML = `${latestVolume} <span class="unit">kg</span>`;
    }

    if (data.length < 2) {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ccc;font-size:12px;">Not enough data</div>';
        return;
    }

    // Render SVG Line Chart
    const width = 100;
    const height = 40;
    const max = Math.max(...data, 100);
    const min = Math.min(...data, 0); // usually 0 based for volume? Or min value?
    // Let's use 0 baseline for volume
    const range = max;

    // Points
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width; // distribute horizontally
        // Invert Y because SVG 0 is top
        const y = height - ((val / range) * height);
        // Clamp y to be inside (e.g. 5px padding)
        const paddedY = 5 + (y * 0.75); // Compress slightly to fit dots
        return `${x} ${paddedY}`; // Just coordinates for now
    });

    // Generate Path
    const pathD = `M ${points.map(p => p.replace(' ', ',')).join(' L ')}`;

    // Generate Circles
    const circles = points.map((p, i) => {
        const [cx, cy] = p.split(' ');
        return `<circle cx="${cx}" cy="${cy}" r="3" fill="#fff" stroke="#7E57C2" stroke-width="2"/>`;
    }).join('');

    const svg = `
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" width="100%" height="100%">
            <path d="${pathD}" stroke="#8E8E93" stroke-width="2" fill="none" stroke-opacity="0.5"/>
            ${circles}
        </svg>
    `;

    container.innerHTML = svg;
}


// ============================================
// HELPERS
// ============================================

function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;

    // Simple set for now, animation can be added later
    el.textContent = target;
}

function toggleFilter(filterType) {
    const options = document.querySelectorAll('.toggle-option');
    options.forEach(opt => opt.classList.remove('active-option'));

    if (filterType === 'active-program') {
        options[0].classList.add('active-option');
        // Filter logic here
    } else {
        options[1].classList.add('active-option');
        // Filter logic here
    }
}
