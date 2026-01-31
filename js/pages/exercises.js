/**
 * Exercises Page JavaScript
 * Handles listing, filtering, searching, and deleting exercises
 */

// State
let currentFilter = 'all';
let allExercises = [];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initSearch();
    loadExercises();
});

// ============================================
// TABS
// ============================================

function initTabs() {
    const tabs = document.querySelectorAll('.tab-button');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update filter
            currentFilter = tab.dataset.filter;
            renderExercises();

            // Update title
            updateTitle();

            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate(10);
        });
    });
}

function updateTitle() {
    const title = document.getElementById('list-title');
    switch (currentFilter) {
        case 'all':
            title.textContent = 'Available';
            break;
        case 'archive':
            title.textContent = 'Archived';
            break;
    }
}

// ============================================
// SEARCH
// ============================================

function initSearch() {
    const searchInput = document.getElementById('search-input');

    searchInput.addEventListener('input', (e) => {
        renderExercises(e.target.value);
    });
}

// ============================================
// LOAD & RENDER
// ============================================

function loadExercises() {
    allExercises = getExercises();
    renderExercises();
}

function renderExercises(searchTerm = '') {
    const list = document.getElementById('exercise-list');
    const emptyState = document.getElementById('empty-state');
    const noResultsState = document.getElementById('no-results-state');

    // Filter exercises
    let filtered = filterExercises(allExercises, currentFilter);

    // Search
    if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(ex => ex.name.toLowerCase().includes(term));
    }

    // Clear list
    list.innerHTML = '';

    // Show appropriate state
    if (allExercises.length === 0) {
        // No exercises at all
        emptyState.style.display = 'flex';
        noResultsState.style.display = 'none';
        list.style.display = 'none';
        return;
    }

    if (filtered.length === 0) {
        // No results for filter/search
        emptyState.style.display = 'none';
        noResultsState.style.display = 'flex';
        list.style.display = 'none';
        return;
    }

    // Show list
    emptyState.style.display = 'none';
    noResultsState.style.display = 'none';
    list.style.display = 'block';

    // Render items
    filtered.forEach(exercise => {
        list.appendChild(createExerciseItem(exercise));
    });
}

function filterExercises(exercises, filter) {
    switch (filter) {
        case 'all':
            return exercises.filter(ex => !ex.archived);
        case 'archive':
            return exercises.filter(ex => ex.archived);
        default:
            return exercises;
    }
}

function createExerciseItem(exercise) {
    const item = document.createElement('div');
    item.className = 'exercise-item';
    item.dataset.id = exercise.id;

    // Get muscle group label
    const muscleGroupLabel = getMuscleGroupLabel(exercise.muscleGroup);

    item.innerHTML = `
        <div class="exercise-icon">
            ${getMuscleGroupIcon(exercise.muscleGroup)}
        </div>
        <div class="exercise-info">
            <div class="exercise-name">${escapeHtml(exercise.name)}</div>
            <div class="exercise-meta">${muscleGroupLabel}</div>
        </div>
        <button class="exercise-delete-btn" onclick="handleDeleteExercise('${exercise.id}', event)" aria-label="Delete">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    return item;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// DELETE ACTION
// ============================================

function handleDeleteExercise(id, event) {
    event.stopPropagation();

    const exercise = getExerciseById(id);
    if (!exercise) return;

    const confirmed = confirm(`Delete "${exercise.name}"?`);

    if (confirmed) {
        deleteExercise(id);
        loadExercises();

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(15);
    }
}
