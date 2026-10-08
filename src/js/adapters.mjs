import { UNITS } from "./unitConversion.mjs";

// Returns a summary of search results from USDA API
export function searchResultsSummary(data) {
    return data.foods.map(food => ({
      fdcId: food.fdcId,
      description: food.description,
      category: food.foodCategory || "General Food",
      dataType: food.dataType
    }));
}

// Returns a summary from USDA food data
export function parseFoodData(food) {
  const { weight, density } = findWeightAndDensity(food);
  const nutrients = {
    calories: findNutrientValue(food.foodNutrients, ["Energy", "Calories"]),
    protein: findNutrientValue(food.foodNutrients, ["Protein"]),
    fat: findNutrientValue(food.foodNutrients, ["Total lipid (fat)"]),
    carbs: findNutrientValue(food.foodNutrients, ["Carbohydrate, by difference"])
  };

  return {
    fdcId: food.fdcId,
    name: food.description,
    gramsPerCup: weight,
    density: Number((density).toFixed(2)),
    category: food.foodCategory.description,
    nutrients
  };
}

// Finds the given nutrients in a list
function findNutrientValue(nutrientsList, names) {
  const val = nutrientsList.find(n => 
    names.some(name => n.nutrient.name.toLowerCase().includes(name.toLowerCase()))
  );

  return val ? Math.round(val.amount || val.value || 0) : 0;
}

// Finds the weight value of a portion in the food data, and calculates the density
function findWeightAndDensity(foodData) {
  let weight = 236.588; // Default weight value in grs
  let density = 1; // Default density value in gr/mL

  const portions = foodData.foodPortions || [];

  const priorityUnits = ["cups", "tbsp", "tsp", "fl_oz", "oz"];

  for (const unitId of priorityUnits) {
    const unit = UNITS[unitId];
    const foundPortion = portions.find(portion => portion.modifier.includes(unit.shortName))
    if (foundPortion?.gramWeight) {
      weight = foundPortion.gramWeight;
      density = weight / unit.toBase;
      return { weight, density };
    }
  }

  return { weight, density };
}

export function parseRecipes(recipeData, quantity) {
  const shuffled = recipeData.meals.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, quantity);
  return selected.map(meal => ({id: meal.idMeal, title: meal.strMeal, image: meal.strMealThumb}));
}

export function parseRecipeDetails(recipeData) {
  if (!recipeData.meals) {
    return null;
  }
  const rawMeal = recipeData.meals[0];
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = rawMeal[`strIngredient${i}`];
    const measure = rawMeal[`strMeasure${i}`];

    if (ingredient && measure) {
      ingredients.push({ingredient: ingredient.trim(), measure: measure.trim()});
    }
  }

  return {
    id: rawMeal.idMeal,
    title: rawMeal.strMeal,
    category: rawMeal.strCategory || "General",
    country: rawMeal.strCountry || rawMeal.strArea || "International",
    instructions: rawMeal.strInstructions || "No instructions available.",
    image: rawMeal.strMealThumb,
    ingredients: ingredients
  };
}