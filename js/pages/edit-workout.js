/**
 * Edit Workout Page JavaScript
 * Load and edit existing workout
 */

// State
let workoutId = '';
let workoutName = '';
let selectedExercises = [];
let allExercises = [];
let originalWorkout = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Get workout ID from session
    workoutId = sessionStorage.getItem('editWorkoutId');

    if (!workoutId) {
        // No workout to edit, go back
        window.location.href = 'index.html';
        return;
    }

    // Load workout data
    const workouts = JSON.parse(localStorage.getItem('fitapp_workouts') || '[]');
    originalWorkout = workouts.find(w => w.id === workoutId);

    if (!originalWorkout) {
        window.location.href = 'index.html';
        return;
    }

    // Set initial values
    workoutName = originalWorkout.name;
    selectedExercises = [...originalWorkout.exercises];

    // Load available exercises
    allExercises = getExercises();

    // Set workout name in input
    document.getElementById('workout-name').value = workoutName;
    document.getElementById('page-title').textContent = 'Edit Workout';

    // Initialize components
    initNameInput();
    initAddButton();
    initPicker();
    initSaveButton();
    initDeleteButton();

    // Initial render
    renderExercises();
    renderMuscleFilters();
});

// ============================================
// NAME INPUT
// ============================================

function initNameInput() {
    const nameInput = document.getElementById('workout-name');

    nameInput.addEventListener('input', () => {
        workoutName = nameInput.value.trim();
    });
}

// ============================================
// DELETE BUTTON
// ============================================

function initDeleteButton() {
    const deleteBtn = document.getElementById('delete-btn');

    deleteBtn.addEventListener('click', () => {
        if (confirm('Delete this workout?')) {
            let workouts = JSON.parse(localStorage.getItem('fitapp_workouts') || '[]');
            workouts = workouts.filter(w => w.id !== workoutId);
            localStorage.setItem('fitapp_workouts', JSON.stringify(workouts));

            sessionStorage.removeItem('editWorkoutId');
            if (navigator.vibrate) navigator.vibrate(20);
            window.location.href = 'index.html';
        }
    });
}

// ============================================
// ADD EXERCISE BUTTON
// ============================================

function initAddButton() {
    const addBtn = document.getElementById('add-exercise-btn');
    addBtn.addEventListener('click', openPicker);
}

// ============================================
// EXERCISE PICKER MODAL
// ============================================

function initPicker() {
    const backdrop = document.getElementById('exercisePickerBackdrop');
    const closeBtn = document.getElementById('picker-close');
    const doneBtn = document.getElementById('picker-done');
    const searchInput = document.getElementById('picker-search-input');

    backdrop.addEventListener('click', closePicker);
    closeBtn.addEventListener('click', closePicker);
    doneBtn.addEventListener('click', closePicker);

    searchInput.addEventListener('input', (e) => {
        renderPickerList(e.target.value);
    });
}

function openPicker() {
    const backdrop = document.getElementById('exercisePickerBackdrop');
    const picker = document.getElementById('exercisePicker');

    backdrop.classList.add('active');
    picker.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Render picker list
    renderPickerList();

    if (navigator.vibrate) navigator.vibrate(15);
}

function closePicker() {
    const backdrop = document.getElementById('exercisePickerBackdrop');
    const picker = document.getElementById('exercisePicker');

    backdrop.classList.remove('active');
    picker.classList.remove('active');
    document.body.style.overflow = '';

    // Clear search
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

    // Add click handlers
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

    // Filter by muscle
    if (muscleFilter !== 'all') {
        filtered = filtered.filter(ex => ex.muscleGroup === muscleFilter);
    }

    // Filter by search
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
        const isAdded = selectedExercises.some(s => s.id === ex.id);
        return `
            <div class="picker-exercise-item" data-id="${ex.id}">
                <div class="picker-exercise-icon">
                    ${getMuscleGroupIcon(ex.muscleGroup)}
                </div>
                <div class="picker-exercise-info">
                    <p class="picker-exercise-name">${escapeHtml(ex.name)}</p>
                    <p class="picker-exercise-muscles">${getMuscleGroupLabel(ex.muscleGroup)}</p>
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

    const existingIndex = selectedExercises.findIndex(ex => ex.id === id);

    if (existingIndex >= 0) {
        selectedExercises.splice(existingIndex, 1);
    } else {
        selectedExercises.push(exercise);
    }

    // Re-render
    renderPickerList(document.getElementById('picker-search-input').value);
    renderExercises();

    if (navigator.vibrate) navigator.vibrate(10);
}

// ============================================
// RENDER WORKOUT EXERCISES
// ============================================

function renderExercises() {
    const listContainer = document.getElementById('exercise-list');
    const countEl = document.getElementById('exercise-count');
    const timeEl = document.getElementById('workout-time');
    const musclesEmpty = document.getElementById('muscles-empty');
    const musclesGrid = document.getElementById('muscles-grid');
    const saveBtn = document.getElementById('save-btn');

    // Update count and time
    countEl.textContent = selectedExercises.length;
    timeEl.textContent = selectedExercises.length * 7; // ~7 min per exercise

    // Enable save button if name and exercises exist
    saveBtn.disabled = selectedExercises.length === 0 || workoutName.trim() === '';

    // Show/hide empty state
    if (selectedExercises.length === 0) {
        musclesEmpty.style.display = 'flex';
        musclesGrid.style.display = 'none';
        listContainer.innerHTML = '';
        return;
    }

    musclesEmpty.style.display = 'none';
    musclesGrid.style.display = 'flex';

    // Calculate muscle groups
    renderMusclesSummary();

    // Render exercise list
    listContainer.innerHTML = selectedExercises.map(ex => `
        <div class="workout-exercise-item" data-id="${ex.id}">
            <div class="exercise-item-header">

                <div class="exercise-item-content">
                    <h3 class="exercise-item-name">${escapeHtml(ex.name)}</h3>
                    <p class="exercise-item-subtitle">No target set</p>
                </div>
                <button class="exercise-item-menu" onclick="removeExercise('${ex.id}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="exercise-item-tags">
                <span class="muscle-tag">${getMuscleGroupLabel(ex.muscleGroup)}</span>
            </div>
        </div>
    `).join('');
}

function renderMusclesSummary() {
    const container = document.getElementById('muscles-grid');

    // Count exercises per muscle group
    const muscleCounts = {};
    selectedExercises.forEach(ex => {
        const muscle = ex.muscleGroup || 'other';
        if (!muscleCounts[muscle]) {
            muscleCounts[muscle] = { count: 0, sets: 0 };
        }
        muscleCounts[muscle].count++;
        muscleCounts[muscle].sets += 3; // Assume 3 sets per exercise
    });

    container.innerHTML = Object.entries(muscleCounts).map(([muscle, data]) => `
        <div class="muscle-pill">
            <div class="muscle-pill-icon">
                ${getMuscleGroupIcon(muscle)}
            </div>
            <div class="muscle-pill-name">${getMuscleGroupLabel(muscle)}</div>
            <div class="muscle-pill-info">${data.count} exercises<br>${data.sets} sets</div>
        </div>
    `).join('');
}

function removeExercise(id) {
    selectedExercises = selectedExercises.filter(ex => ex.id !== id);
    renderExercises();
    if (navigator.vibrate) navigator.vibrate(15);
}

// ============================================
// SAVE WORKOUT
// ============================================

function initSaveButton() {
    const saveBtn = document.getElementById('save-btn');

    saveBtn.addEventListener('click', () => {
        if (selectedExercises.length === 0 || workoutName.trim() === '') return;

        // Update workout object
        let workouts = JSON.parse(localStorage.getItem('fitapp_workouts') || '[]');
        const index = workouts.findIndex(w => w.id === workoutId);

        if (index >= 0) {
            workouts[index] = {
                ...workouts[index],
                name: workoutName,
                exercises: selectedExercises.map(ex => ({
                    id: ex.id,
                    name: ex.name,
                    muscleGroup: ex.muscleGroup
                })),
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem('fitapp_workouts', JSON.stringify(workouts));
        }

        // Clear session
        sessionStorage.removeItem('editWorkoutId');

        // Navigate back
        if (navigator.vibrate) navigator.vibrate(20);
        window.location.href = 'index.html';
    });
}

// ============================================
// HELPERS
// ============================================

// Get exercises from database.js or localStorage
function getExercises() {
    // Try to use database.js function if available
    if (typeof window.getExercisesFromDB === 'function') {
        return window.getExercisesFromDB();
    }
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem('fitapp_exercises') || '[]');
}

