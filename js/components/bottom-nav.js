// Für zukünftige Erweiterungen (z.B. aktiven Tab markieren via JS)
document.querySelectorAll('.tab-item').forEach(item => {
    item.addEventListener('click', () => {
        haptic(10);
    });
});