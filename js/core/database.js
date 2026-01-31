/**
 * FitApp Database Layer
 * LocalStorage-based CRUD operations for exercises
 */

const DB_KEYS = {
    EXERCISES: 'fitapp_exercises'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique ID
 */
function generateId() {
    return 'ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// EXERCISES CRUD
// ============================================

/**
 * Get all exercises from LocalStorage
 * @returns {Array} Array of exercise objects
 */
function getExercises() {
    const data = localStorage.getItem(DB_KEYS.EXERCISES);
    return data ? JSON.parse(data) : [];
}

/**
 * Get a single exercise by ID
 * @param {string} id - Exercise ID
 * @returns {Object|null} Exercise object or null
 */
function getExerciseById(id) {
    const exercises = getExercises();
    return exercises.find(ex => ex.id === id) || null;
}

/**
 * Save a new exercise
 * @param {Object} exercise - Exercise data (without id)
 * @returns {Object} Saved exercise with ID
 */
function saveExercise(exercise) {
    const exercises = getExercises();

    const newExercise = {
        id: generateId(),
        name: exercise.name,
        muscleGroup: exercise.muscleGroup || 'chest',
        archived: false,
        createdAt: new Date().toISOString()
    };

    exercises.push(newExercise);
    localStorage.setItem(DB_KEYS.EXERCISES, JSON.stringify(exercises));

    return newExercise;
}

/**
 * Update an existing exercise
 * @param {string} id - Exercise ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated exercise or null
 */
function updateExercise(id, updates) {
    const exercises = getExercises();
    const index = exercises.findIndex(ex => ex.id === id);

    if (index === -1) return null;

    exercises[index] = { ...exercises[index], ...updates };
    localStorage.setItem(DB_KEYS.EXERCISES, JSON.stringify(exercises));

    return exercises[index];
}

/**
 * Delete an exercise by ID
 * @param {string} id - Exercise ID
 * @returns {boolean} Success status
 */
function deleteExercise(id) {
    const exercises = getExercises();
    const filtered = exercises.filter(ex => ex.id !== id);

    if (filtered.length === exercises.length) return false;

    localStorage.setItem(DB_KEYS.EXERCISES, JSON.stringify(filtered));
    return true;
}

/**
 * Archive/Unarchive an exercise
 * @param {string} id - Exercise ID
 * @param {boolean} archived - Archive status
 * @returns {Object|null} Updated exercise or null
 */
function toggleArchiveExercise(id, archived) {
    return updateExercise(id, { archived });
}

// ============================================
// DATA MANAGEMENT
// ============================================

/**
 * Export all app data as JSON
 * @returns {Object} All app data
 */
function exportAllData() {
    return {
        exercises: getExercises(),
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };
}

/**
 * Download data as JSON file
 */
function downloadDataExport() {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `fitapp_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Delete all app data
 * @returns {boolean} Success status
 */
function deleteAllData() {
    localStorage.removeItem(DB_KEYS.EXERCISES);
    // Add more keys here as app grows
    return true;
}

/**
 * Import data from JSON
 * @param {Object} data - Imported data object
 * @returns {boolean} Success status
 */
function importData(data) {
    try {
        if (data.exercises && Array.isArray(data.exercises)) {
            localStorage.setItem(DB_KEYS.EXERCISES, JSON.stringify(data.exercises));
        }
        return true;
    } catch (e) {
        console.error('Import failed:', e);
        return false;
    }
}

// ============================================
// MUSCLE GROUP HELPERS
// ============================================

/**
 * Get display name for muscle group
 * @param {string} muscleGroup - Muscle group key
 * @returns {string} Display name
 */
function getMuscleGroupLabel(muscleGroup) {
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

/**
 * Get SVG icon for muscle group
 * @param {string} muscleGroup - Muscle group key
 * @returns {string} SVG markup
 */
function getMuscleGroupIcon(muscleGroup) {
    // Simple circle icon with first letter
    const label = getMuscleGroupLabel(muscleGroup);
    const letter = label.charAt(0).toUpperCase();

    return `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#F2F2F7"/>
        <text x="20" y="25" text-anchor="middle" font-size="16" font-weight="600" fill="#8E8E93">${letter}</text>
    </svg>`;
}
