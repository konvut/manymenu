document.addEventListener('DOMContentLoaded', function() {
    loadMenu('en'); // Load English menu by default
});

let currentCategory = 'all';
let currentLanguage = 'en';


// Function to create HTML for each menu item
function createMenuItemHTML(item) {
    let imageHTML = item.image ? `<img src="${item.image}" alt="${item.name}" class="menu-item-image">` : '';
    let descriptionHTML = item.description ? `<div class="menu-item-description">${item.description}</div>` : '';
    let tagsHTML = item.tags ? `<ul class="menu-item-tags">${item.tags.map(tag => `<li>${tag}</li>`).join('')}</ul>` : '';
    return `
        <div class="menu-item">
            ${imageHTML}
            <div class="menu-item-details">
                <div class="menu-item-name">${item.name}</div>
                ${descriptionHTML}
                <div class="menu-item-price">${item.price}</div>
                ${tagsHTML}
            </div>
        </div>
    `;
}

function createCategoryTabs(categories) {
    const tabs = document.getElementById('menuTabs');
    tabs.innerHTML = ''; // Clear out the existing tabs

    // Create 'All' tab
    let allButton = document.createElement('button');
    allButton.className = 'tab-link active';
    allButton.textContent = 'All';
    allButton.onclick = function(event) { showItems(event, 'all', categories); };
    tabs.appendChild(allButton);

    // Create tabs for each category
    Object.keys(categories).forEach(category => {
        let button = document.createElement('button');
        button.className = 'tab-link';
        button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        button.onclick = function(event) { showItems(event, category, categories); };
        tabs.appendChild(button);
    });

    // Show all items by default
    showItems(null, 'all', categories);
}

function showItems(evt, category, categories) {
    if (evt) {
        // Update active state on tabs
        const tabLinks = document.getElementsByClassName('tab-link');
        for (let tabLink of tabLinks) {
            tabLink.classList.remove('active');
        }
        evt.currentTarget.classList.add('active');
        document.getElementById('filterControls').style.display = 'none';
    }

    currentCategory = category;
    const items = category === 'all' ? Object.values(categories).flat() : categories[category];

    const content = document.getElementById('tabContentContainer');
    content.innerHTML = '';
    items.forEach(item => {
        content.innerHTML += createMenuItemHTML(item);
    });

    // Clear the active filter display
    document.getElementById('activeFilter').textContent = '';
}

function loadMenu(language) {
    currentLanguage = language;
    fetch(`menu_${language}.json`)
        .then(response => response.json())
        .then(categories => {
            createCategoryTabs(categories);
        })
        .catch(error => {
            console.error('Error loading menu:', error);
        });
}

function filterByTag(tag, categories) {
    const items = currentCategory === 'all' ? Object.values(categories).flat() : categories[currentCategory];
    const filteredItems = items.filter(item => item.tags && item.tags.includes(tag));

    const content = document.getElementById('tabContentContainer');
    content.innerHTML = '';
    filteredItems.forEach(item => {
        content.innerHTML += createMenuItemHTML(item);
    });

    // Display the active filter
    document.getElementById('activeFilter').innerHTML = `Filtering by: <span class="filter-tag">${tag}</span>`;
    document.getElementById('filterControls').style.display = 'inline';
    document.getElementById('clearFilterButton').style.display = 'inline';
}

document.getElementById('tabContentContainer').addEventListener('click', function(event) {
    if (event.target.tagName === 'LI' && event.target.parentNode.className.includes('menu-item-tags')) {
        const tag = event.target.textContent;
        fetch(`menu_${currentLanguage}.json`)
            .then(response => response.json())
            .then(categories => filterByTag(tag, categories))
            .catch(error => console.error('Error loading menu:', error));
    }
});

// Function to clear the filter
function clearFilter() {
    fetch(`menu_${currentLanguage}.json`)
        .then(response => response.json())
        .then(categories => {
            showItems(null, currentCategory, categories);
        })
        .catch(error => console.error('Error loading menu:', error));
        document.getElementById('filterControls').style.display = 'none';
}