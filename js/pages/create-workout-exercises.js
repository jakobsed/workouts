/**
 * Create Workout - Exercises Page JavaScript
 * Step 2: Add exercises to workout
 */

// State
let workoutName = '';
let selectedExercises = [];
let allExercises = [];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Get workout name from session
    workoutName = sessionStorage.getItem('newWorkoutName') || 'New Workout';

    // Load available exercises
    allExercises = getExercises();

    // Initialize components
    initAddButton();
    initPicker();
    initSaveButton();

    // Initial render
    renderExercises();
    renderMuscleFilters();
});

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
    const doneBtn = document.getElementById('picker-done');
    const searchInput = document.getElementById('picker-search-input');

    backdrop.addEventListener('click', closePicker);
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

    // Enable/disable save button
    saveBtn.disabled = selectedExercises.length === 0;

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
                 <div class="drag-handle" style="padding: 0 12px 0 0; cursor: grab; color: #C7C7CC; display: flex; align-items: center;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </div>
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

    // Init Sortable
    if (window.Sortable) {
        if (window.sortableInstance) window.sortableInstance.destroy(); // Cleanup old instance
        window.sortableInstance = new Sortable(listContainer, {
            animation: 150,
            handle: '.drag-handle',
            onEnd: function (evt) {
                const itemEl = evt.item;
                const newIndex = evt.newIndex;
                const oldIndex = evt.oldIndex;

                // Move item in array
                const item = selectedExercises.splice(oldIndex, 1)[0];
                selectedExercises.splice(newIndex, 0, item);

                // Haptic feedback
                if (navigator.vibrate) navigator.vibrate(10);
            }
        });
    }
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
        if (selectedExercises.length === 0) return;

        // Create workout object
        const workout = {
            id: 'wo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: workoutName,
            exercises: selectedExercises.map(ex => ({
                id: ex.id,
                name: ex.name,
                muscleGroup: ex.muscleGroup
            })),
            createdAt: new Date().toISOString()
        };

        // Save to LocalStorage
        saveWorkout(workout);

        // Clear session
        sessionStorage.removeItem('newWorkoutName');

        // Navigate back
        if (navigator.vibrate) navigator.vibrate(20);
        window.location.href = 'index.html';
    });
}

function saveWorkout(workout) {
    const workouts = JSON.parse(localStorage.getItem('fitapp_workouts') || '[]');
    workouts.push(workout);
    localStorage.setItem('fitapp_workouts', JSON.stringify(workouts));
}

// ============================================
// HELPERS
// ============================================

