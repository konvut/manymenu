document.addEventListener('DOMContentLoaded', function() {
    loadMenu('en'); // Load English menu by default
    // Event listener for opening the modal
    document.getElementById('tabContentContainer').addEventListener('click', function(event) {
        if (event.target.className.includes('menu-item-image')) {
            openModal(event.target.src, event.target.alt);
        }
    });
});

function openModal(imageSrc, imageAlt) {
    let modal = document.getElementById('myModal');
    let modalImg = document.getElementById("img01");
    let captionText = document.getElementById("caption");
    
    modal.style.display = "block";
    modalImg.src = imageSrc;
    captionText.innerHTML = imageAlt;

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() { 
        modal.style.display = "none";
    }
}

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

    categories.forEach(categoryObj => {
        let button = document.createElement('button');
        button.className = 'tab-link';
        button.textContent = categoryObj.category;
        button.onclick = function(event) { showItems(event, categoryObj.category, categories); };
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

    const content = document.getElementById('tabContentContainer');
    content.innerHTML = '';

    if (category === 'all') {
        // Flatten all items from all categories
        categories.forEach(categoryObj => {
            categoryObj.items.forEach(item => {
                content.innerHTML += createMenuItemHTML(item);
            });
        });
    } else {
        // Find the category object and display its items
        const categoryObj = categories.find(cat => cat.category === category);
        if (categoryObj && categoryObj.items) {
            categoryObj.items.forEach(item => {
                content.innerHTML += createMenuItemHTML(item);
            });
        }
    }

    // Clear the active filter display
    document.getElementById('activeFilter').textContent = '';
}


function loadMenu(language) {
    currentLanguage = language;
    fetch(`menu_${language}.json`)
        .then(response => response.json())
        .then(data => {
            createCategoryTabs(data.categories);
            displayRestaurantInfo(data)
        })
        .catch(error => {
            console.error('Error loading menu:', error);
        });
}

function filterByTag(tag, categories) {
    let filteredItems = [];

    if (currentCategory === 'all') {
        // If 'all' categories, flatten all items from all categories and then filter
        filteredItems = categories.flatMap(categoryObj => categoryObj.items)
                                   .filter(item => item.tags && item.tags.includes(tag));
    } else {
        // Find the specific category and filter its items
        const categoryObj = categories.find(cat => cat.category === currentCategory);
        if (categoryObj && categoryObj.items) {
            filteredItems = categoryObj.items.filter(item => item.tags && item.tags.includes(tag));
        }
    }

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
            .then(data => filterByTag(tag, data.categories))
            .catch(error => console.error('Error loading menu:', error));
    }
});

// Function to clear the filter
function clearFilter() {
    fetch(`menu_${currentLanguage}.json`)
        .then(response => response.json())
        .then(data => {
            showItems(null, currentCategory, data.categories);
        })
        .catch(error => console.error('Error loading menu:', error));
        document.getElementById('filterControls').style.display = 'none';
}

function displayRestaurantInfo(data) {
    // Display restaurant name and description
    document.getElementById('restaurantName').textContent = data.restaurant_name || 'Restaurant Name';
    document.getElementById('restaurantDescription').textContent = data.restaurant_description || 'Restaurant Description';

    // Check for each contact detail and update if available
    if (data.contacts) {
        if (data.contacts.phone) {
            document.getElementById('contactPhone').textContent = data.contacts.phone;
        } else {
            document.getElementById('contactPhone').textContent = '';
        }

        if (data.contacts.address) {
            document.getElementById('contactAddress').textContent = data.contacts.address;
        } else {
            document.getElementById('contactAddress').textContent = '';
        }
    } else {
        // Clear all contact details if none are provided
        document.getElementById('contactPhone').textContent = '';
        document.getElementById('contactAddress').textContent = '';
    }
}