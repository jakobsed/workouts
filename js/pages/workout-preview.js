/**
 * Workout Preview Page JavaScript
 * Load and display workout details before starting
 */

// State
let workoutId = '';
let workout = null;
let allExercises = [];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Get workout ID from session or URL
    workoutId = sessionStorage.getItem('activeWorkoutId') || sessionStorage.getItem('previewWorkoutId');

    if (!workoutId) {
        window.location.href = 'index.html';
        return;
    }

    // Load workout data
    const workouts = JSON.parse(localStorage.getItem('fitapp_workouts') || '[]');
    workout = workouts.find(w => w.id === workoutId);

    if (!workout) {
        window.location.href = 'index.html';
        return;
    }

    // Load available exercises for picker
    allExercises = getExercises();

    // Render page
    renderWorkoutPreview();

    // Initialize components
    initStartButton();
    initDeleteButton();
    initAddButton();
    initPicker();
});

// ============================================
// RENDER
// ============================================

function renderWorkoutPreview() {
    // Set title
    document.getElementById('workout-title').textContent = workout.name;

    // Render exercises
    renderExerciseList();

    // Update counts
    document.getElementById('exercise-count').textContent = workout.exercises.length;
    document.getElementById('workout-time').textContent = workout.exercises.length * 7;
}

function renderExerciseList() {
    const container = document.getElementById('exercise-list');

    container.innerHTML = workout.exercises.map((ex, index) => {
        // Generate default sets if not defined
        const sets = ex.sets || [
            { reps: '6-8' },
            { reps: '6-8' }
        ];

        return `
            <div class="exercise-item" data-id="${ex.id}">
                <div class="exercise-item-top">
                    <div class="exercise-item-image">
                        ${getExerciseIcon(ex.muscleGroup)}
                    </div>
                    <div class="exercise-item-main">
                        <div class="exercise-item-header">
                            <h3 class="exercise-item-name">${escapeHtml(ex.name)}</h3>
                            <button class="exercise-item-menu" aria-label="Options" onclick="removeExercise('${ex.id}')">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="exercise-sets">
                            ${sets.map((set, i) => `
                                <div class="exercise-set-row">
                                    <span class="set-number">${i + 1}</span>
                                    <span class="set-reps">${set.reps || '6-8'} reps</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="exercise-tags">
                    ${getMusclesForExercise(ex).map(m => `
                        <span class="exercise-tag">${m}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// ACTIONS
// ============================================

function initDeleteButton() {
    const deleteBtn = document.getElementById('delete-btn');

    if (!deleteBtn) return;

    deleteBtn.addEventListener('click', () => {
        try {
            if (!workoutId) {
                console.error('No workout ID found');
                return;
            }

            if (confirm('Delete this workout?')) {
                let workouts = JSON.parse(localStorage.getItem('fitapp_workouts') || '[]');
                workouts = workouts.filter(w => w.id !== workoutId);
                localStorage.setItem('fitapp_workouts', JSON.stringify(workouts));

                if (navigator.vibrate) {
                    try { navigator.vibrate(20); } catch (e) { }
                }
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Error deleting workout:', error);
            alert('Could not delete workout. Please try again.');
        }
    });
}

function removeExercise(exerciseId) {
    if (confirm('Remove this exercise?')) {
        workout.exercises = workout.exercises.filter(ex => ex.id !== exerciseId);
        saveWorkout();
        renderWorkoutPreview();
    }
}

// ============================================
// ADD EXERCISE (PICKER)
// ============================================

function initAddButton() {
    const addBtn = document.getElementById('add-exercise-btn');
    addBtn.addEventListener('click', openPicker);
}

function initPicker() {
    const backdrop = document.getElementById('exercisePickerBackdrop');
    const doneBtn = document.getElementById('picker-done');
    const searchInput = document.getElementById('picker-search-input');

    backdrop.addEventListener('click', closePicker);
    doneBtn.addEventListener('click', closePicker);

    searchInput.addEventListener('input', (e) => {
        renderPickerList(e.target.value);
    });

    renderMuscleFilters();
}

function openPicker() {
    const backdrop = document.getElementById('exercisePickerBackdrop');
    const picker = document.getElementById('exercisePicker');

    backdrop.classList.add('active');
    picker.classList.add('active');
    document.body.style.overflow = 'hidden';

    renderPickerList();

    if (navigator.vibrate) navigator.vibrate(15);
}

function closePicker() {
    const backdrop = document.getElementById('exercisePickerBackdrop');
    const picker = document.getElementById('exercisePicker');

    backdrop.classList.remove('active');
    picker.classList.remove('active');
    document.body.style.overflow = '';

    document.getElementById('picker-search-input').value = '';
}

function renderMuscleFilters() {
    const container = document.getElementById('muscle-filters');

    const muscles = [
        { id: 'all', label: 'All', icon: '🏋️' },
        { id: 'chest', label: 'Chest' },
        { id: 'back', label: 'Back' },
        { id: 'shoulders', label: 'Shoulders' },
        { id: 'biceps', label: 'Biceps' },
        { id: 'triceps', label: 'Triceps' },
        { id: 'quads', label: 'Quads' },
        { id: 'glutes', label: 'Glutes' },
        { id: 'hamstrings', label: 'Hamstrings' }
    ];

    container.innerHTML = muscles.map((m, i) => `
        <button class="muscle-filter-btn ${i === 0 ? 'active' : ''}" data-muscle="${m.id}">
            ${m.label}
        </button>
    `).join('');

    container.querySelectorAll('.muscle-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.muscle-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPickerList('', btn.dataset.muscle);
        });
    });
}

function renderPickerList(searchTerm = '', muscleFilter = 'all') {
    const container = document.getElementById('picker-list');

    let filtered = allExercises.filter(ex => !ex.archived);

    if (muscleFilter !== 'all') {
        filtered = filtered.filter(ex => ex.muscleGroup === muscleFilter);
    }

    if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(ex => ex.name.toLowerCase().includes(term));
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--ios-text-secondary);">
                <p>No exercises found</p>
                <p style="font-size: 14px;">Create exercises in the Exercises section first</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(ex => {
        const isAdded = workout.exercises.some(s => s.id === ex.id);
        return `
            <div class="picker-exercise-item" data-id="${ex.id}">
                <div class="picker-exercise-icon">
                    ${getMuscleGroupIcon(ex.muscleGroup)}
                </div>
                <div class="picker-exercise-info">
                    <p class="picker-exercise-name">${escapeHtml(ex.name)}</p>
                    <p class="picker-exercise-muscles">${getMuscleLabel(ex.muscleGroup)}</p>
                </div>
                <button class="picker-exercise-add" onclick="toggleExercise('${ex.id}')" ${isAdded ? 'style="color: #34C759;"' : ''}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${isAdded ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'}
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

function toggleExercise(id) {
    const exercise = allExercises.find(ex => ex.id === id);
    if (!exercise) return;

    const existingIndex = workout.exercises.findIndex(ex => ex.id === id);

    if (existingIndex >= 0) {
        workout.exercises.splice(existingIndex, 1);
    } else {
        workout.exercises.push({
            id: exercise.id,
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            sets: [
                { reps: '6-8' },
                { reps: '6-8' }
            ]
        });
    }

    saveWorkout();
    renderPickerList(document.getElementById('picker-search-input').value);
    renderWorkoutPreview();

    if (navigator.vibrate) navigator.vibrate(10);
}

function saveWorkout() {
    let workouts = JSON.parse(localStorage.getItem('fitapp_workouts') || '[]');
    const index = workouts.findIndex(w => w.id === workoutId);

    if (index >= 0) {
        workout.updatedAt = new Date().toISOString();
        workouts[index] = workout;
        localStorage.setItem('fitapp_workouts', JSON.stringify(workouts));
    }
}

// ============================================
// START WORKOUT
// ============================================

function initStartButton() {
    const startBtn = document.getElementById('start-btn');

    startBtn.addEventListener('click', () => {
        sessionStorage.setItem('activeWorkoutId', workoutId);

        const activeWorkout = {
            workoutId: workoutId,
            startedAt: new Date().toISOString(),
            exercises: workout.exercises.map(ex => ({
                ...ex,
                sets: (ex.sets || [{ reps: '6-8' }, { reps: '6-8' }]).map(set => ({
                    ...set,
                    completed: false,
                    actualWeight: null,
                    actualReps: null
                }))
            })),
            currentExerciseIndex: 0
        };

        sessionStorage.setItem('activeWorkoutState', JSON.stringify(activeWorkout));

        if (navigator.vibrate) navigator.vibrate(20);
        window.location.href = 'active-workout.html';
    });
}

// ============================================
// HELPERS
// ============================================

function getExercises() {
    if (typeof window.getExercisesFromDB === 'function') {
        return window.getExercisesFromDB();
    }
    return JSON.parse(localStorage.getItem('fitapp_exercises') || '[]');
}

function getMusclesForExercise(exercise) {
    const mainMuscle = getMuscleLabel(exercise.muscleGroup);
    return [mainMuscle];
}

