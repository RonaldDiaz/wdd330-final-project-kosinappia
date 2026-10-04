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
  let weight = 240; // Default weight value in grs
  let density = 1; // Default density value in gr/mL

  const portions = foodData.foodPortions || [];
  const cupPortion = portions.find(portion => portion.modifier.includes("cup"));

  if (cupPortion.gramWeight) {
      weight = cupPortion.gramWeight;
      density = weight / 236.588; // 1 cup = 236.588 mL
    } else {
      const tbspPortion = portions.find(portion => portion.modifier.includes("tbsp"));
      if (tbspPortion.gramWeight) {
        weight = tbspPortion.gramWeight;
        density = weight / 14.787; // 1 tbsp = 14.787 mL
      }
    }

  return { weight, density };
}