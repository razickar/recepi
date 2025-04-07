async function searchMeal() {
  const userinp = document.getElementById('searchInput').value;
  const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${userinp}`);
  const data = await response.json();

  const container = document.getElementById('recipes');
  container.innerHTML = ''; 

  if (data.meals) {
    data.meals.forEach(meal => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h3>${meal.strMeal}</h3>
        <p>Category: ${meal.strCategory}</p>
        <p>Area:${meal.strArea}</p>`;
      container.appendChild(card);
    });
  }
  else {
    container.innerHTML = `<p>No recipes found.</p>`;
  }
}

// edu summa vachipommm!!!....
searchMeal();

