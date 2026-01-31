/**
 * Active Workout Page JavaScript
 * Handles timer, set tracking, and exercise navigation
 */

// State
let activeWorkout = null;
let startTime = null;
let timerInterval = null;
let restTimerInterval = null;
let restSeconds = 0;
let currentExerciseIndex = 0;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Load active workout state
    const stateJson = sessionStorage.getItem('activeWorkoutState');

    if (!stateJson) {
        window.location.href = 'index.html';
        return;
    }

    activeWorkout = JSON.parse(stateJson);
    startTime = new Date(activeWorkout.startedAt);
    currentExerciseIndex = activeWorkout.currentExerciseIndex || 0;

    // Initialize UI
    renderExerciseCarousel();
    loadCurrentExercise();
    startTimer();

    // Event listeners
    initMenuButton();
    initOptionsSheet();
    initAddSetButton();
});

// ============================================
// TIMER
// ============================================

function startTimer() {
    timerInterval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);

        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;

        document.getElementById('workout-timer').textContent =
            `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function startRestTimer() {
    restSeconds = 0;

    if (restTimerInterval) {
        clearInterval(restTimerInterval);
    }

    restTimerInterval = setInterval(() => {
        restSeconds++;
        const minutes = Math.floor(restSeconds / 60);
        const seconds = restSeconds % 60;
        document.getElementById('rest-timer').textContent =
            `${minutes}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

function resetRestTimer() {
    if (restTimerInterval) {
        clearInterval(restTimerInterval);
    }
    restSeconds = 0;
    document.getElementById('rest-timer').textContent = '0:00';
}

// ============================================
// EXERCISE CAROUSEL
// ============================================

function renderExerciseCarousel() {
    const container = document.getElementById('exercise-carousel');

    container.innerHTML = activeWorkout.exercises.map((ex, index) => {
        const isActive = index === activeWorkout.currentExerciseIndex;
        const isCompleted = ex.sets.every(s => s.completed);

        return `
            <div class="carousel-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                 data-index="${index}" 
                 onclick="selectExercise(${index})">
                <span class="carousel-item-icon" style="font-size: 16px;">${getExerciseIcon(ex.muscleGroup)}</span>
            </div>
        `;
    }).join('');
}

function selectExercise(index) {
    currentExerciseIndex = index;
    activeWorkout.currentExerciseIndex = index;
    saveState();

    renderExerciseCarousel();
    loadCurrentExercise();

    if (navigator.vibrate) navigator.vibrate(10);
}

// ============================================
// CURRENT EXERCISE
// ============================================

function loadCurrentExercise() {
    const exercise = activeWorkout.exercises[currentExerciseIndex];
    if (!exercise) return;

    // Update header
    document.getElementById('exercise-name').textContent = exercise.name;

    // Calculate current set
    const completedSets = exercise.sets.filter(s => s.completed).length;
    const totalSets = exercise.sets.length;
    document.getElementById('set-info').textContent = `Set ${completedSets + 1} of ${totalSets}`;

    // Render set table
    renderSetTable(exercise);
}

function renderSetTable(exercise) {
    const container = document.getElementById('set-table-body');

    container.innerHTML = exercise.sets.map((set, index) => `
        <div class="set-row ${set.completed ? 'completed' : ''}" data-set="${index}">
            <div class="set-number">${index + 1}</div>
            <div>
                <input type="number" 
                       class="set-input weight-input" 
                       placeholder="—" 
                       value="${set.actualWeight || ''}"
                       data-set="${index}"
                       onchange="updateSetWeight(${index}, this.value)">
            </div>
            <div>
                <input type="number" 
                       class="set-input reps-input" 
                       placeholder="${set.reps?.split('-')[1] || '8'}"
                       value="${set.actualReps || ''}"
                       data-set="${index}"
                       onchange="updateSetReps(${index}, this.value)">
            </div>
            <div>
                <button class="set-check ${set.completed ? 'checked' : ''}" onclick="toggleSetComplete(${index})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// SET ACTIONS
// ============================================

function updateSetWeight(setIndex, value) {
    const exercise = activeWorkout.exercises[currentExerciseIndex];
    exercise.sets[setIndex].actualWeight = value ? parseFloat(value) : null;
    saveState();
}

function updateSetReps(setIndex, value) {
    const exercise = activeWorkout.exercises[currentExerciseIndex];
    exercise.sets[setIndex].actualReps = value ? parseInt(value) : null;
    saveState();
}

function toggleSetComplete(setIndex) {
    const exercise = activeWorkout.exercises[currentExerciseIndex];
    const set = exercise.sets[setIndex];

    set.completed = !set.completed;

    if (set.completed) {
        // Start rest timer when set is completed
        startRestTimer();
        if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
    } else {
        resetRestTimer();
    }

    saveState();
    loadCurrentExercise();
    renderExerciseCarousel();
}

function initAddSetButton() {
    document.getElementById('add-set-btn').addEventListener('click', () => {
        const exercise = activeWorkout.exercises[currentExerciseIndex];

        exercise.sets.push({
            reps: '6-8',
            completed: false,
            actualWeight: null,
            actualReps: null
        });

        saveState();
        loadCurrentExercise();

        if (navigator.vibrate) navigator.vibrate(10);
    });
}

// ============================================
// OPTIONS SHEET
// ============================================

function initMenuButton() {
    document.getElementById('menu-btn').addEventListener('click', openOptions);
}

function initOptionsSheet() {
    const backdrop = document.getElementById('optionsBackdrop');
    const closeBtn = document.getElementById('options-close');

    backdrop.addEventListener('click', closeOptions);
    closeBtn.addEventListener('click', closeOptions);

    // Option handlers
    document.getElementById('option-finish').addEventListener('click', finishWorkout);
    document.getElementById('option-discard').addEventListener('click', discardWorkout);
}

function openOptions() {
    document.getElementById('optionsBackdrop').classList.add('active');
    document.getElementById('optionsSheet').classList.add('active');
    if (navigator.vibrate) navigator.vibrate(15);
}

function closeOptions() {
    document.getElementById('optionsBackdrop').classList.remove('active');
    document.getElementById('optionsSheet').classList.remove('active');
}

function finishWorkout() {
    closeOptions();

    // Save workout to history
    saveWorkoutToHistory();

    // Clear active state
    sessionStorage.removeItem('activeWorkoutState');
    sessionStorage.removeItem('activeWorkoutId');

    // Navigate to complete page
    window.location.href = 'workout-complete.html';
}

function discardWorkout() {
    if (confirm('Discard this workout? All progress will be lost.')) {
        // Clear timers
        clearInterval(timerInterval);
        clearInterval(restTimerInterval);

        // Clear session
        sessionStorage.removeItem('activeWorkoutState');
        sessionStorage.removeItem('activeWorkoutId');

        if (navigator.vibrate) navigator.vibrate(20);
        window.location.href = 'index.html';
    }
}

// ============================================
// DATA PERSISTENCE
// ============================================

function saveState() {
    sessionStorage.setItem('activeWorkoutState', JSON.stringify(activeWorkout));
}

function saveWorkoutToHistory() {
    const now = new Date();
    const endTime = now.toISOString();
    const duration = Math.floor((now - startTime) / 1000);

    // Calculate total volume
    let totalVolume = 0;
    let totalReps = 0;

    activeWorkout.exercises.forEach(ex => {
        ex.sets.forEach(set => {
            if (set.completed && set.actualWeight && set.actualReps) {
                totalVolume += set.actualWeight * set.actualReps;
                totalReps += set.actualReps;
            }
        });
    });

    const historyEntry = {
        id: 'history_' + Date.now(),
        workoutId: activeWorkout.workoutId,
        startedAt: activeWorkout.startedAt,
        endedAt: endTime,
        duration: duration,
        exercises: activeWorkout.exercises,
        totalVolume: totalVolume,
        totalReps: totalReps
    };

    // Save to localStorage
    const history = JSON.parse(localStorage.getItem('fitapp_workout_history') || '[]');
    history.unshift(historyEntry);
    localStorage.setItem('fitapp_workout_history', JSON.stringify(history));

    // Also save for complete page
    sessionStorage.setItem('completedWorkout', JSON.stringify(historyEntry));
}

// ============================================
// HELPERS
// ============================================

