document.addEventListener('DOMContentLoaded', () => {
    renderLevels();
});

const levelsData = {
    upperBody: [
        { id: 'front-delts', name: 'Front Delts', sets: 2, maxSets: 4 }, // maxSets estimated for bar width
        { id: 'triceps', name: 'Triceps', sets: 1, maxSets: 4 },
        { id: 'side-delts', name: 'Side Delts', sets: 1, maxSets: 4 },
        { id: 'upper-traps', name: 'Upper Traps', sets: 1, maxSets: 4 },
        { id: 'serratus', name: 'Serratus', sets: 1, maxSets: 4 },
        { id: 'chest', name: 'Chest', sets: 0, maxSets: 4 }
    ],
    lowerBody: [
        { id: 'quads', name: 'Quads', sets: 0, maxSets: 4 },
        { id: 'glutes', name: 'Glutes', sets: 0, maxSets: 4 },
        { id: 'hamstrings', name: 'Hamstrings', sets: 0, maxSets: 4 },
        { id: 'calves', name: 'Calves', sets: 0, maxSets: 4 },
        { id: 'abductors', name: 'Abductors', sets: 0, maxSets: 4 },
        { id: 'adductors', name: 'Adductors', sets: 0, maxSets: 4 }
    ]
};

function renderLevels() {
    const upperContainer = document.getElementById('upper-body-list');
    const lowerContainer = document.getElementById('lower-body-list');

    if (upperContainer) {
        upperContainer.innerHTML = generateLevelItems(levelsData.upperBody);
    }
    
    if (lowerContainer) {
        lowerContainer.innerHTML = generateLevelItems(levelsData.lowerBody);
    }
}

function generateLevelItems(items) {
    return items.map((item, index) => {
        const isLast = index === items.length - 1;
        const width = item.sets > 0 ? (item.sets * 30) : 0; // 30px per set based on visual estimation
        
        return `
            <div class="level-item">
                <div class="muscle-image-container">
                    <div class="muscle-placeholder"></div>
                    <!-- TODO: Replace placeholder with <img src="assets/muscles/${item.id}.png" ...> -->
                </div>
                <div class="level-info">
                    <div class="level-name">${item.name}</div>
                    <div class="level-sets">${item.sets} ${item.sets === 1 ? 'set' : 'sets'}</div>
                </div>
                <div class="level-progress">
                    ${width > 0 ? `<div class="level-progress-bar" style="width: ${width}px;"></div>` : ''}
                </div>
            </div>
            ${!isLast ? '<div class="level-divider"></div>' : ''}
        `;
    }).join('');
}
