/**
 * Create Workout Page JavaScript
 * Step 1: Workout Name Entry
 */

document.addEventListener('DOMContentLoaded', () => {
    initForm();
});

function initForm() {
    const nameInput = document.getElementById('workout-name');
    const nextBtn = document.getElementById('next-btn');

    // Validate on input
    nameInput.addEventListener('input', () => {
        const isValid = nameInput.value.trim().length > 0;
        nextBtn.disabled = !isValid;
    });

    // Handle next button
    nextBtn.addEventListener('click', () => {
        const workoutName = nameInput.value.trim();

        if (workoutName) {
            // Store workout name for next step
            sessionStorage.setItem('newWorkoutName', workoutName);

            // Navigate to step 2 (add exercises)
            window.location.href = 'create-workout-exercises.html';
        }
    });

    // Allow Enter key to proceed
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && nameInput.value.trim().length > 0) {
            nextBtn.click();
        }
    });
}
