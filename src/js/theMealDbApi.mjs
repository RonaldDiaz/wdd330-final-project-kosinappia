const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export async function getRecipesByIngredient(ingredient) {
  const formattedIngredient = ingredient.trim().toLowerCase();
  
  try {
    const response = await fetch(`${BASE_URL}/filter.php?i=${formattedIngredient}`);
    if (!response.ok) {
      throw new Error(`Error obtaining the recipes: ${response.status}`);
    }
    const recipeData = await response.json();
    return recipeData;    
  } catch (error) {
    if (!navigator.onLine) {
      throw new Error("No internet connection.");
    }
    if (error.message === "Failed to fetch") {
      throw new Error("There was a problem reaching theMealDB server.");
    }
    throw error;
  }
}

export async function getRecipeDetailsById(idMeal) {
  try {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${idMeal}`);
    if (!response.ok) {
      throw new Error(`Error obtaining the details: ${response.status}`);
    }
    const data = await response.json();
    if (!data.meals) return null;
    return data;
  } catch (error) {
    if (!navigator.onLine) {
      throw new Error("No internet connection.");
    }
    if (error.message === "Failed to fetch") {
      throw new Error("There was a problem reaching theMealDB server.");
    }
    throw error;
  }
}