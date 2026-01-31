/**
 * Core Utilities
 * Shared helper functions for the application
 */

// ============================================
// HAPTICS
// ============================================

function haptic(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
}

// ============================================
// HTML SAFETY
// ============================================

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// MUSCLE GROUP HELPERS
// ============================================

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
    return labels[muscleGroup] || muscleGroup || 'Other';
}

// Alias for compatibility
function getMuscleLabel(muscleGroup) {
    return getMuscleGroupLabel(muscleGroup);
}

function getMuscleGroupIcon(muscleGroup) {
    // Simple letter icons for each muscle group
    const icons = {
        'chest': 'C',
        'back': 'B',
        'biceps': 'Bi',
        'triceps': 'Tr',
        'shoulders': 'Sh',
        'abs': 'Ab',
        'traps': 'Tp',
        'forearms': 'Fa',
        'quads': 'Qu',
        'glutes': 'Gl',
        'hamstrings': 'Hm',
        'calves': 'Ca',
        'adductors': 'Ad'
    };
    return icons[muscleGroup] || muscleGroup?.charAt(0).toUpperCase() || '?';
}

// Alias for compatibility if needed, but we mostly use getMuscleGroupIcon
function getExerciseIcon(muscleGroup) {
    return getMuscleGroupIcon(muscleGroup);
}