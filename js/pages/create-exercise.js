/**
 * Create Exercise Page JavaScript
 * Handles form validation and exercise creation
 */

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initForm();
});

// ============================================
// FORM HANDLING
// ============================================

function initForm() {
    const nameInput = document.getElementById('exercise-name');
    const muscleGroupSelect = document.getElementById('exercise-muscle-group');
    const saveBtn = document.getElementById('save-btn');

    // Validate on input
    nameInput.addEventListener('input', validateForm);
    muscleGroupSelect.addEventListener('change', validateForm);

    // Save handler
    saveBtn.addEventListener('click', saveExerciseHandler);

    // Initial validation
    validateForm();
}

function validateForm() {
    const nameInput = document.getElementById('exercise-name');
    const muscleGroupSelect = document.getElementById('exercise-muscle-group');
    const saveBtn = document.getElementById('save-btn');

    const nameValid = nameInput.value.trim().length > 0;
    const muscleGroupValid = muscleGroupSelect.value !== '';

    const isValid = nameValid && muscleGroupValid;

    saveBtn.disabled = !isValid;

    return isValid;
}

// ============================================
// SAVE EXERCISE
// ============================================

function saveExerciseHandler() {
    if (!validateForm()) return;

    const name = document.getElementById('exercise-name').value.trim();
    const muscleGroup = document.getElementById('exercise-muscle-group').value;

    // Create exercise object
    const exercise = {
        name,
        muscleGroup
    };

    // Save to database
    const saved = saveExercise(exercise);

    if (saved) {
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(20);

        // Navigate back to exercises list
        window.location.href = 'exercises.html';
    } else {
        alert('Error saving exercise. Please try again.');
    }
}

// ============================================
// FORM HELPERS
// ============================================

function resetForm() {
    document.getElementById('exercise-name').value = '';
    document.getElementById('exercise-muscle-group').value = '';
    validateForm();
}
