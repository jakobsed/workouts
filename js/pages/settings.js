/**
 * Settings Page JavaScript
 * Handles data export and deletion
 */

// ============================================
// DATA EXPORT
// ============================================

function handleExportData() {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(15);

    try {
        downloadDataExport();

        // Show success message
        showToast('Data exported successfully!');
    } catch (e) {
        console.error('Export failed:', e);
        alert('Export failed. Please try again.');
    }
}

// ============================================
// DATA DELETION
// ============================================

function handleDeleteData() {
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(15);

    // Show confirmation dialog
    const confirmed = confirm(
        '⚠️ Delete All Data?\n\n' +
        'This will permanently delete:\n' +
        '• All your custom exercises\n' +
        '• All workout history\n' +
        '• All settings\n\n' +
        'This action cannot be undone.'
    );

    if (confirmed) {
        // Double confirmation for safety
        const doubleConfirmed = confirm(
            'Are you absolutely sure?\n\n' +
            'Type OK to confirm deletion.'
        );

        if (doubleConfirmed) {
            deleteAllData();

            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

            showToast('All data deleted');

            // Refresh page after short delay
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, duration = 2000) {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 20px;
        font-size: 15px;
        z-index: 9999;
        animation: toastFadeIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Add animation keyframes if not exists
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes toastFadeIn {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            @keyframes toastFadeOut {
                from { opacity: 1; transform: translateX(-50%) translateY(0); }
                to { opacity: 0; transform: translateX(-50%) translateY(20px); }
            }
        `;
        document.head.appendChild(style);
    }

    // Remove after duration
    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
