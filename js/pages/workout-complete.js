/**
 * Workout Complete Page JavaScript
 * Displays summary of completed workout
 */

document.addEventListener('DOMContentLoaded', () => {
    // Load completed workout data
    const workoutData = JSON.parse(sessionStorage.getItem('completedWorkout'));

    if (!workoutData) {
        window.location.href = 'index.html';
        return;
    }

    renderMuscleIllustration(workoutData);
    renderAchievements(workoutData);
    renderDetails(workoutData);
});

// ============================================
// RENDERERS
// ============================================

function renderMuscleIllustration(workout) {
    const container = document.getElementById('muscle-illustration');

    // Calculate targeted muscles
    const muscles = new Set();
    workout.exercises.forEach(ex => {
        if (ex.muscleGroup) muscles.add(ex.muscleGroup);
    });

    // Render front and back bodies
    container.innerHTML = `
        ${getBodySvg('front', Array.from(muscles))}
        ${getBodySvg('back', Array.from(muscles))}
    `;
}

function renderAchievements(workout) {
    const container = document.getElementById('achievement-cards');

    // Analyze workout for records (mock logic for now)
    const achievements = [
        {
            icon: '🏆',
            value: `${formatWeight(workout.totalVolume)} kg`,
            isNew: true,
            title: workout.exercises[0]?.name || 'Workout',
            type: 'Volume Record'
        },
        {
            icon: '⚡️',
            value: `${workout.totalReps} eps`,
            isNew: false,
            title: 'Total Reps',
            type: 'Workout Intensity'
        }
    ];

    container.innerHTML = achievements.map(ach => `
        <div class="achievement-card">
            <span class="achievement-icon">${ach.icon}</span>
            <div class="achievement-value">
                ${ach.value}
                ${ach.isNew ? '<span class="achievement-new">New!</span>' : ''}
            </div>
            <p class="achievement-title">${escapeHtml(ach.title)}</p>
            <p class="achievement-type">${ach.type}</p>
        </div>
    `).join('');
}

function renderDetails(workout) {
    const container = document.getElementById('details-grid');

    const startTime = new Date(workout.startedAt);
    const endTime = new Date(workout.endedAt);

    const details = [
        { label: 'Duration', value: formatDuration(workout.duration) },
        { label: 'Volume', value: `${formatWeight(workout.totalVolume)} kg` },
        { label: 'Exercises', value: workout.exercises.length },
        { label: 'Sets Completed', value: countCompletedSets(workout) }
    ];

    container.innerHTML = details.map(detail => `
        <div class="detail-item">
            <span class="detail-label">${detail.label}</span>
            <span class="detail-value">${detail.value}</span>
        </div>
    `).join('');
}

// ============================================
// BODY VISUALIZATION
// ============================================

function getBodySvg(view, highlightedMuscles) {
    // This is a simplified version - in a real app full paths would be used
    const isFront = view === 'front';

    return `
        <svg viewBox="0 0 48 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="${isFront ? getFrontBodyPath() : getBackBodyPath()}" 
                  fill="#F2F2F7" />
            
            ${highlightedMuscles.map(m => getMusclePath(m, view)).join('')}
        </svg>
    `;
}

function getFrontBodyPath() {
    return "M16 20 C16 15 32 15 32 20 L36 28 L42 40 L40 50 L34 40 L32 55 L34 75 L30 95 L26 75 L24 60 L22 75 L18 95 L14 75 L16 55 L14 40 L8 50 L6 40 L12 28 Z";
}

function getBackBodyPath() {
    return "M16 20 C16 15 32 15 32 20 L38 28 L44 40 L42 50 L36 40 L34 55 L36 75 L32 95 L28 75 L26 60 L24 75 L20 95 L16 75 L18 55 L16 40 L6 50 L4 40 L10 28 Z";
}

function getMusclePath(muscle, view) {
    // Mock mapping for demonstration
    // In production this would return specific SVG paths for each muscle
    const color = "#007AFF";

    if (view === 'front') {
        if (muscle === 'chest') return `<path d="M18 28 L30 28 L28 35 L20 35 Z" fill="${color}" />`;
        if (muscle === 'abs') return `<path d="M20 36 L28 36 L26 50 L22 50 Z" fill="${color}" />`;
        if (muscle === 'quads') return `<path d="M16 55 L22 55 L21 70 L17 70 Z M26 55 L32 55 L31 70 L27 70 Z" fill="${color}" />`;
        if (muscle === 'biceps') return `<path d="M12 30 L16 30 L15 36 L11 36 Z M32 30 L36 30 L35 36 L33 36 Z" fill="${color}" />`;
        if (muscle === 'shoulders') return `<path d="M10 24 L16 22 L16 28 L10 28 Z M32 22 L38 24 L38 28 L32 28 Z" fill="${color}" />`;
    } else {
        if (muscle === 'back') return `<path d="M18 24 L30 24 L28 40 L20 40 Z" fill="${color}" />`;
        if (muscle === 'glutes') return `<path d="M18 50 L30 50 L28 60 L20 60 Z" fill="${color}" />`;
        if (muscle === 'hamstrings') return `<path d="M17 62 L21 62 L20 75 L18 75 Z M27 62 L31 62 L30 75 L28 75 Z" fill="${color}" />`;
        if (muscle === 'calves') return `<path d="M18 78 L21 78 L20 90 L18 90 Z M27 78 L30 78 L29 90 L27 90 Z" fill="${color}" />`;
        if (muscle === 'triceps') return `<path d="M11 30 L15 30 L14 36 L10 36 Z M33 30 L37 30 L36 36 L34 36 Z" fill="${color}" />`;
    }
    return '';
}

// ============================================
// HELPERS
// ============================================

function countCompletedSets(workout) {
    let count = 0;
    workout.exercises.forEach(ex => {
        count += ex.sets.filter(s => s.completed).length;
    });
    return count;
}

function formatDuration(seconds) {
    const min = Math.floor(seconds / 60);
    const h = Math.floor(min / 60);
    const m = min % 60;

    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
}

function formatWeight(weight) {
    return new Intl.NumberFormat('en-US').format(weight);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
