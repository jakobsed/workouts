document.addEventListener('DOMContentLoaded', () => {
    renderLevels();
});

const levelsData = {
    upperBody: [
        { id: 'chest', name: 'Chest', sets: 0, maxSets: 4 },
        { id: 'back', name: 'Back', sets: 0, maxSets: 4 },
        { id: 'shoulders', name: 'Shoulders', sets: 0, maxSets: 4 },
        { id: 'biceps', name: 'Biceps', sets: 0, maxSets: 4 },
        { id: 'triceps', name: 'Triceps', sets: 0, maxSets: 4 },
        { id: 'traps', name: 'Traps', sets: 0, maxSets: 4 },
        { id: 'forearms', name: 'Forearms', sets: 0, maxSets: 4 },
        { id: 'abs', name: 'Abs', sets: 0, maxSets: 4 }
    ],
    lowerBody: [
        { id: 'quads', name: 'Quads', sets: 0, maxSets: 4 },
        { id: 'glutes', name: 'Glutes', sets: 0, maxSets: 4 },
        { id: 'hamstrings', name: 'Hamstrings', sets: 0, maxSets: 4 },
        { id: 'calves', name: 'Calves', sets: 0, maxSets: 4 },
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
                    <!-- Image will be added here later if available -->
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
