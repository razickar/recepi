// API URL
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const recipesGrid = document.getElementById('recipes-grid');
const featuredRecipes = document.getElementById('featured-recipes');
const recipesHeading = document.getElementById('recipes-heading');
const categoryItems = document.querySelectorAll('#category-list li');
const modal = document.getElementById('recipe-modal');
const closeButton = document.querySelector('.close-button');
const recipeDetails = document.getElementById('recipe-details');
const themeToggle = document.getElementById('theme-toggle');

// State
let currentCategory = 'all';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Event Listeners
searchButton.addEventListener('click', searchRecipes);
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchRecipes();
    }
});

categoryItems.forEach(item => {
    item.addEventListener('click', function() {
        // Update active class
        categoryItems.forEach(cat => cat.classList.remove('active'));
        this.classList.add('active');
        
        // Get category and fetch recipes
        const category = this.getAttribute('data-category');
        currentCategory = category;
        
        if (category === 'all') {
            recipesHeading.textContent = 'All Recipes';
            fetchRandomRecipes();
        } else {
            recipesHeading.textContent = `${category} Recipes`;
            fetchRecipesByCategory(category);
        }
    });
});

closeButton.addEventListener('click', closeModal);

window.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeModal();
    }
});

themeToggle.addEventListener('click', toggleTheme);

// Theme Toggle Function
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDarkMode = document.body.classList.contains('dark-theme');
    themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkMode', isDarkMode);
}

// Check if dark mode was previously enabled
function checkTheme() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Modal Functions
function openModal(mealId) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    fetchMealDetails(mealId);
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// API Functions
function fetchRandomRecipes() {
    showLoading(true);
    
    // Fetch multiple random recipes
    const promises = [];
    for (let i = 0; i < 8; i++) {
        promises.push(fetch(`${API_BASE_URL}/random.php`)
            .then(response => response.json())
            .then(data => data.meals[0]));
    }

    Promise.all(promises)
        .then(meals => {
            displayRecipes(meals);
            showLoading(false);
        })
        .catch(error => {
            console.error('Error fetching random recipes:', error);
            showLoading(false);
            recipesGrid.innerHTML = '<p>Failed to load recipes. Please try again later.</p>';
        });
}

function fetchFeaturedRecipes() {
    // Get 5 featured recipes (using random for demo)
    const promises = [];
    for (let i = 0; i < 5; i++) {
        promises.push(fetch(`${API_BASE_URL}/random.php`)
            .then(response => response.json())
            .then(data => data.meals[0]));
    }

    Promise.all(promises)
        .then(meals => {
            displayFeaturedRecipes(meals);
        })
        .catch(error => {
            console.error('Error fetching featured recipes:', error);
            featuredRecipes.innerHTML = '<p>Failed to load featured recipes.</p>';
        });
}

function fetchRecipesByCategory(category) {
    showLoading(true);
    
    fetch(`${API_BASE_URL}/filter.php?c=${category}`)
        .then(response => response.json())
        .then(data => {
            displayRecipes(data.meals);
            showLoading(false);
        })
        .catch(error => {
            console.error(`Error fetching ${category} recipes:`, error);
            showLoading(false);
            recipesGrid.innerHTML = '<p>Failed to load recipes. Please try again later.</p>';
        });
}

function searchRecipes() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    showLoading(true);
    recipesHeading.textContent = `Search Results for "${query}"`;
    
    fetch(`${API_BASE_URL}/search.php?s=${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.meals) {
                displayRecipes(data.meals);
            } else {
                recipesGrid.innerHTML = `<p>No recipes found for "${query}". Try a different search term.</p>`;
            }
            showLoading(false);
        })
        .catch(error => {
            console.error('Error searching recipes:', error);
            showLoading(false);
            recipesGrid.innerHTML = '<p>Failed to search recipes. Please try again later.</p>';
        });
}

function fetchMealDetails(mealId) {
    recipeDetails.innerHTML = '<div class="loading"><div class="spinner"></div><p>Preparing recipe...</p></div>';
    
    fetch(`${API_BASE_URL}/lookup.php?i=${mealId}`)
        .then(response => response.json())
        .then(data => {
            const meal = data.meals[0];
            displayMealDetails(meal);
        })
        .catch(error => {
            console.error('Error fetching meal details:', error);
            recipeDetails.innerHTML = '<p>Failed to load recipe details. Please try again later.</p>';
        });
}

// Display Functions
function displayRecipes(meals) {
    if (!meals) {
        recipesGrid.innerHTML = '<p>No recipes found.</p>';
        return;
    }
    
    recipesGrid.innerHTML = '';
    
    meals.forEach(meal => {
        const recipeCard = createRecipeCard(meal);
        recipesGrid.appendChild(recipeCard);
    });
}

function displayFeaturedRecipes(meals) {
    featuredRecipes.innerHTML = '';
    
    meals.forEach(meal => {
        const recipeCard = createRecipeCard(meal);
        featuredRecipes.appendChild(recipeCard);
    });
}

function createRecipeCard(meal) {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';
    recipeCard.setAttribute('data-id', meal.idMeal);
    
    // Check if this meal is in favorites
    const isFavorite = favorites.includes(meal.idMeal);
    
    recipeCard.innerHTML = `
        <div class="recipe-image-container">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-image">
        </div>
        <div class="recipe-info">
            <h3 class="recipe-title">${meal.strMeal}</h3>
            <span class="recipe-category">${meal.strCategory || 'Uncategorized'}</span>
        </div>
    `;
    
    recipeCard.addEventListener('click', function() {
        openModal(meal.idMeal);
    });
    
    return recipeCard;
}

function displayMealDetails(meal) {
    // Get all ingredients and measures
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim() !== '') {
            ingredients.push(`${measure ? measure.trim() : ''} ${ingredient.trim()}`);
        }
    }
    
    // Check if this meal is in favorites
    const isFavorite = favorites.includes(meal.idMeal);
    const favoriteButtonClass = isFavorite ? 'fas fa-heart' : 'far fa-heart';
    
    // Format instructions
    const instructions = meal.strInstructions.split('\r\n')
        .filter(step => step.trim() !== '')
        .map((step, index) => `<p><strong>${index + 1}.</strong> ${step}</p>`)
        .join('');
    
    recipeDetails.innerHTML = `
        <div class="recipe-details-header">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-details-image">
            <div class="recipe-details-info">
                <h3 class="recipe-details-title">${meal.strMeal}</h3>
                <div class="recipe-meta">
                    <div class="recipe-tag"><i class="fas fa-utensils"></i> ${meal.strCategory}</div>
                    ${meal.strArea ? `<div class="recipe-tag"><i class="fas fa-globe"></i> ${meal.strArea}</div>` : ''}
                    ${meal.strTags ? meal.strTags.split(',').map(tag => 
                        `<div class="recipe-tag"><i class="fas fa-tag"></i> ${tag.trim()}</div>`
                    ).join('') : ''}
                </div>
                <div class="recipe-actions">
                    <button class="action-button favorite-button" id="favorite-button" data-id="${meal.idMeal}">
                        <i class="${favoriteButtonClass}"></i> ${isFavorite ? 'Saved' : 'Save Recipe'}
                    </button>
                    ${meal.strYoutube ? `
                        <a href="${meal.strYoutube}" target="_blank" class="action-button">
                            <i class="fab fa-youtube"></i> Watch Video
                        </a>
                    ` : ''}
                    ${meal.strSource ? `
                        <a href="${meal.strSource}" target="_blank" class="action-button">
                            <i class="fas fa-external-link-alt"></i> Source
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
        <div class="recipe-content">
            <div class="recipe-ingredients">
                <h3>Ingredients</h3>
                <ul>
                    ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </div>
            <div class="recipe-instructions">
                <h3>Instructions</h3>
                ${instructions}
            </div>
        </div>
    `;
    
    // Add event listener for favorite button
    const favoriteButton = document.getElementById('favorite-button');
    favoriteButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFavorite(meal.idMeal);
        
        // Update button UI
        const isFav = favorites.includes(meal.idMeal);
        favoriteButton.innerHTML = `
            <i class="${isFav ? 'fas fa-heart' : 'far fa-heart'}"></i> 
            ${isFav ? 'Saved' : 'Save Recipe'}
        `;
    });
}

// Favorites Functions
function toggleFavorite(mealId) {
    const index = favorites.indexOf(mealId);
    
    if (index === -1) {
        // Add to favorites
        favorites.push(mealId);
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
    }
    
    // Update local storage
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function fetchFavorites() {
    if (favorites.length === 0) {
        recipesGrid.innerHTML = '<p>You have no saved recipes yet. Click the heart icon on any recipe to save it.</p>';
        return;
    }
    
    showLoading(true);
    recipesHeading.textContent = 'Favorite Recipes';
    
    const promises = favorites.map(id => 
        fetch(`${API_BASE_URL}/lookup.php?i=${id}`)
            .then(response => response.json())
            .then(data => data.meals[0])
    );
    
    Promise.all(promises)
        .then(meals => {
            // Filter out any null values (in case a recipe was removed from API)
            const validMeals = meals.filter(meal => meal !== undefined);
            displayRecipes(validMeals);
            showLoading(false);
        })
        .catch(error => {
            console.error('Error fetching favorites:', error);
            showLoading(false);
            recipesGrid.innerHTML = '<p>Failed to load favorite recipes. Please try again later.</p>';
        });
}

// Helper Functions
function showLoading(isLoading) {
    if (isLoading) {
        recipesGrid.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Gathering ingredients...</p>
            </div>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkTheme();
    fetchRandomRecipes();
    fetchFeaturedRecipes();
    
    // Set up menu clicks
    document.querySelector('.menu li:nth-child(1)').addEventListener('click', function() {
        currentCategory = 'all';
        recipesHeading.textContent = 'All Recipes';
        fetchRandomRecipes();
    });
    
    document.querySelector('.menu li:nth-child(3)').addEventListener('click', function() {
        fetchFavorites();
    });
    
    document.querySelector('.menu li:nth-child(4)').addEventListener('click', function() {
        currentCategory = 'random';
        recipesHeading.textContent = 'Random Recipe';
        fetch(`${API_BASE_URL}/random.php`)
            .then(response => response.json())
            .then(data => {
                displayRecipes([data.meals[0]]);
            })
            .catch(error => {
                console.error('Error fetching random recipe:', error);
                recipesGrid.innerHTML = '<p>Failed to load random recipe. Please try again later.</p>';
            });
    });
});