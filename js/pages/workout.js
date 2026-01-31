/**
 * Workout Page JavaScript
 * Handles workout library display with swipe actions
 */

function haptic(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
}

// ============================================
// WORKOUT LIBRARY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadWorkoutLibrary();
});

let libraryCollapsed = false;

function loadWorkoutLibrary() {
    const container = document.getElementById('workout-cards');
    const section = document.getElementById('workout-library-section');

    if (!container || !section) return;

    const workouts = getWorkouts();

    // Hide section if no workouts
    if (workouts.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    renderWorkoutCards(workouts);
}

function getWorkouts() {
    return JSON.parse(localStorage.getItem('fitapp_workouts') || '[]');
}

function saveWorkouts(workouts) {
    localStorage.setItem('fitapp_workouts', JSON.stringify(workouts));
}

function renderWorkoutCards(workouts) {
    const container = document.getElementById('workout-cards');

    container.innerHTML = workouts.map(workout => {
        // Get exercise names
        const exerciseNames = workout.exercises.map(ex => ex.name).join(', ');

        // Get unique muscle groups
        const muscles = [...new Set(workout.exercises.map(ex => ex.muscleGroup))];
        const muscleTags = muscles.map(m => getMuscleLabel(m));

        return `
            <div class="swipeable-card" data-workout-id="${workout.id}">
                <div class="swipe-actions">
                    <button class="swipe-btn edit-btn" onclick="editWorkout('${workout.id}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="swipe-btn delete-btn" onclick="deleteWorkout('${workout.id}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
                <div class="workout-card" onclick="openWorkoutPreview('${workout.id}')">
                    <div class="workout-card-header">
                        <h3 class="workout-card-title">${escapeHtml(workout.name)}</h3>
                        <svg class="workout-card-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                    <p class="workout-card-exercises">${escapeHtml(exerciseNames)}</p>
                    <div class="workout-card-tags">
                        ${muscleTags.map(tag => `<span class="workout-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Initialize swipe gestures
    initSwipeCards();
}

// ============================================
// SWIPE GESTURES
// ============================================

function initSwipeCards() {
    const cards = document.querySelectorAll('.swipeable-card');

    cards.forEach(card => {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        const cardContent = card.querySelector('.workout-card');

        cardContent.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            cardContent.style.transition = 'none';
        }, { passive: true });

        cardContent.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;

            // Only allow left swipe (negative diff)
            if (diff < 0) {
                const transform = Math.max(diff, -120);
                cardContent.style.transform = `translateX(${transform}px)`;
            }
        }, { passive: true });

        cardContent.addEventListener('touchend', () => {
            isDragging = false;
            cardContent.style.transition = 'transform 0.3s ease';

            const diff = currentX - startX;

            if (diff < -60) {
                // Show actions
                cardContent.style.transform = 'translateX(-100px)';
                card.classList.add('swiped');
                haptic(15);
            } else {
                // Reset
                cardContent.style.transform = 'translateX(0)';
                card.classList.remove('swiped');
            }

            startX = 0;
            currentX = 0;
        });

        // Close when clicking elsewhere
        document.addEventListener('touchstart', (e) => {
            if (!card.contains(e.target) && card.classList.contains('swiped')) {
                cardContent.style.transition = 'transform 0.3s ease';
                cardContent.style.transform = 'translateX(0)';
                card.classList.remove('swiped');
            }
        });
    });
}

// ============================================
// WORKOUT ACTIONS
// ============================================

function openWorkoutPreview(workoutId) {
    sessionStorage.setItem('previewWorkoutId', workoutId);
    window.location.href = 'workout-preview.html';
}

function editWorkout(workoutId) {
    // Store workout ID for edit page
    sessionStorage.setItem('editWorkoutId', workoutId);
    window.location.href = 'edit-workout.html';
}

function deleteWorkout(workoutId) {
    // Stop event bubbling
    event.stopPropagation();

    // Confirm deletion
    if (confirm('Delete this workout?')) {
        let workouts = getWorkouts();
        workouts = workouts.filter(w => w.id !== workoutId);
        saveWorkouts(workouts);

        haptic(20);
        loadWorkoutLibrary();
    }
}

function startWorkout(workoutId) {
    // Store workout ID for active workout page
    sessionStorage.setItem('activeWorkoutId', workoutId);
    window.location.href = 'active-workout.html';
}

function toggleLibrary() {
    const container = document.getElementById('workout-cards');
    const btn = document.getElementById('collapse-library-btn');

    libraryCollapsed = !libraryCollapsed;

    if (libraryCollapsed) {
        container.style.display = 'none';
        btn.textContent = 'Expand';
    } else {
        container.style.display = 'flex';
        btn.textContent = 'Collapse';
    }
}

// ============================================
// HELPERS
// ============================================

function getMuscleLabel(muscleGroup) {
    const labels = {
        'chest': 'Chest',
        'back': 'Back',
        'biceps': 'Biceps',
        'triceps': 'Triceps',
        'shoulders': 'Shoulders',
        'abs': 'Abs',
        'traps': 'Traps',
        'forearms': 'Forearms',
        'quads': 'Quads',
        'glutes': 'Glutes',
        'hamstrings': 'Hamstrings',
        'calves': 'Calves',
        'adductors': 'Adductors'
    };
    return labels[muscleGroup] || muscleGroup;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}