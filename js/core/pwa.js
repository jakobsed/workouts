/**
 * PWA Support & iOS Fixes
 */

// iOS Standalone Mode Links Fix
// Prevents links from opening in Mobile Safari when running in standalone mode
if (window.navigator.standalone) {
    document.addEventListener('click', (e) => {
        let el = e.target;
        while (el && el.tagName !== 'A') { el = el.parentNode; }

        if (!el || !el.href) return;

        // Ignore links with specific attributes or external links
        if (el.getAttribute('target') === '_blank' ||
            el.getAttribute('download') !== null ||
            el.getAttribute('onclick') !== null) {
            return;
        }

        // Check if internal link
        if (el.href.indexOf(location.host) !== -1) {
            e.preventDefault();
            window.location.href = el.href;
        }
    }, false);
}
