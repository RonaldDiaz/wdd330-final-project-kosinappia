import { COMMON_INGREDIENTS, defaultIngredient } from "./data/data.mjs";
import { getIngredientDetails } from "./usdaApi.mjs";
import { getRecipesByIngredient, getRecipeDetailsById } from "./theMealDbApi.mjs";
import { parseFoodData, parseRecipes, parseRecipeDetails } from "./adapters.mjs";
import { renderWithTemplate, renderListWithTemplate, openRecipeModal } from "./ui.mjs";
import { convertAmount } from "./unitConversion.mjs";
import { notificationManager } from "./NotificationManager";

export default class Converter {
  constructor(elements) {
    Object.assign(this, elements);
    this.currentSearch = "";
    this.currentFilter = "all";
		this.currentIngredient = defaultIngredient;
    this.currentAmount = 1;
    this.currentFromUnit = "cups";
    this.currentToUnit = "grams";
  }

  init() {
		this.populateIngredientsOptions();
		this.populateUnitOptions(this.fromUnit, this.currentFromUnit);
    this.populateUnitOptions(this.toUnit, this.currentToUnit);
    this.renderIngredient();
    this.renderResults();
    this.bindListeners();
    this.renderRecipes();
  }

  populateIngredientsOptions() {
    const filteredIngredients = COMMON_INGREDIENTS.filter(ingredient => {
      const matchName = !this.currentSearch || ingredient.name.toLowerCase().includes(this.currentSearch.toLowerCase())
      const matchCategory = this.currentFilter === "all" || ingredient.category === this.currentFilter;
      return matchName && matchCategory;
    })

    const categoryGroup = {};
    filteredIngredients.forEach(ingredient => {
      if (!categoryGroup[ingredient.category]) {
        categoryGroup[ingredient.category] = [];
      }
      categoryGroup[ingredient.category].push(ingredient);
    })

    renderListWithTemplate(([category, ingredients]) => optgroupTemplate(category, ingredients, this.currentIngredient.fdcId),
      this.ingredientSelect, Object.entries(categoryGroup), "beforeend", true);
    
    if (filteredIngredients.length === 0) {
      renderWithTemplate(emptyIngredientOptionTemplate, this.ingredientSelect);
    }
	}
	
	populateUnitOptions(selectItem, defaultValue) {
		selectItem.innerHTML = unitsTemplate;
		selectItem.value = defaultValue;
	}

	bindListeners() {
		// Ingredient selection change
    this.ingredientSelect.addEventListener("change", async () => {
      const selectedFdcId = this.ingredientSelect.value;
      this.activeIngredientName.textContent = "Loading...";
      this.ingredientDescription.textContent = "Waiting for data."
      try {
        const ingredientData = await getIngredientDetails(selectedFdcId);
        this.currentIngredient = parseFoodData(ingredientData);
      } catch (err) {
        notificationManager.show(`There was a problem loading ingredients: ${err.message}`, "error");
      }      
      this.currentIngredient.commonName = this.ingredientSelect.options[this.ingredientSelect.selectedIndex].text;
      this.renderIngredient();
      this.renderResults();
      this.renderRecipes();
    });

		// Amount change
		this.amount.addEventListener("input", () => {
			const value = parseFloat(this.amount.value);
      this.currentAmount = isNaN(value) ? 0 : value;
      this.renderResults();
    })
    
    // From unit change
    this.fromUnit.addEventListener("change", () => {
      this.currentFromUnit = this.fromUnit.value;
      this.renderResults();
    });

    // To unit change
    this.toUnit.addEventListener("change", () => {
      this.currentToUnit = this.toUnit.value;
      this.renderResults();
    });

    // Swap units click
    this.swapUnits.addEventListener("click", () => {
      const temp = this.currentToUnit;
      this.currentToUnit = this.currentFromUnit;
      this.currentFromUnit = temp;
      this.fromUnit.value = this.currentFromUnit;
      this.toUnit.value = this.currentToUnit;
      this.renderResults();
    })

    // Preset buttons click
    this.presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const presetAmount = btn.dataset.amount;
        const presetUnit = btn.dataset.unit;
        this.currentAmount = parseFloat(presetAmount);
        this.amount.value = presetAmount;
        this.currentFromUnit = presetUnit;
        this.fromUnit.value = presetUnit;
        this.renderResults();
      })
    })

    // Search bar input
    this.ingredientSearchInput.addEventListener("input", () => {
      this.currentSearch = this.ingredientSearchInput.value.trim();
      this.searchClearBtn.style.display = this.currentSearch ? "block" : "none";
      this.populateIngredientsOptions();
      this.ingredientSelect.dispatchEvent(new Event("change"));
    })

    // Clear search click
    this.searchClearBtn.addEventListener("click", () => {
      this.ingredientSearchInput.value = "";
      this.currentSearch = "";
      this.searchClearBtn.style.display = "none";
      this.populateIngredientsOptions();
      this.ingredientSelect.dispatchEvent(new Event("change")); 
    })

    // Category filter buttons click
    this.filterBtns.forEach(filterBtn => {
      filterBtn.addEventListener("click", () => {
        this.filterBtns.forEach(b => b.classList.remove("active"));
        filterBtn.classList.add("active");
        this.currentFilter = filterBtn.dataset.category;
        this.populateIngredientsOptions();
        this.ingredientSelect.dispatchEvent(new Event("change"));        
      })
    })
  }

  renderIngredient() {
    this.activeIngredientName.textContent = this.currentIngredient.name;
    renderWithTemplate(descriptionTemplate(this.currentIngredient),this.ingredientDescription);
  }
  
  renderResults() {
    const result = convertAmount(this.currentAmount, this.currentFromUnit, this.currentToUnit, this.currentIngredient)
    this.resultNumber.textContent = result.result;
    this.resultUnit.textContent = result.unit;
    this.practicalMeasureValue.textContent = result.measure;
    this.practicalMeasureNote.textContent = result.note;
    this.formula.textContent = result.formula;
    this.calories.textContent = result.calories;
    this.carbs.textContent = result.carbs;
    this.protein.textContent = result.protein;
    this.fat.textContent = result.fat;
  }
  
  async renderRecipes() {
    this.recipesGrid.textContent = "Loading recipes...";
    const recipeData = await getRecipesByIngredient(this.currentIngredient.commonName);
    if (!recipeData.meals || recipeData.meals.length === 0) {
      const emptyState = emptyRecipeTemplate(this.currentIngredient.commonName);
      renderWithTemplate(emptyState, this.recipesGrid);
      return;
    }
    const randomRecipes = parseRecipes(recipeData, 6);
    this.recipesGrid.textContent = "";

    randomRecipes.forEach(recipe => {
      const card = document.createElement("article");
      card.className = "recipe-card";
      card.innerHTML = `
        <div class="recipe-thumbnail-wrap">
          <img class="recipe-thumbnail" src="${recipe.image}" alt="${recipe.title}" loading="lazy">
        </div>
        <div class="recipe-content">
          <h3 class="recipe-title">${recipe.title}</h3>
          <button type="button" class="btn btn-secondary recipe-btn" data-id="${recipe.id}">View Recipe</button>
        </div>
      `;
      const viewBtn = card.querySelector(".recipe-btn");
      viewBtn.addEventListener("click", async (event) => {
        const recipeDetails = await getRecipeDetailsById(event.target.dataset.id);
        const parsedRecipeDetails = parseRecipeDetails(recipeDetails);
        openRecipeModal(parsedRecipeDetails);
      });
      this.recipesGrid.appendChild(card);
    });
  }
}

function descriptionTemplate(currentIngredient) {
  return `
    <span>${currentIngredient.category}</span>
    <span>·</span>
    <span>${currentIngredient.density} g/ml</span>
    <span>·</span>
    <span>1 cup = ${currentIngredient.gramsPerCup}g</span>
    <span>·</span>
    <span>FDC ID: ${currentIngredient.fdcId}</span>
  `;
}

function optgroupTemplate(category, ingredients, currentIngredient) {
  return `
    <optgroup label="${category}">
      ${ingredients.map(ingredient => `
        <option value="${ingredient.fdcId}" ${ingredient.fdcId === currentIngredient.fdcId ? "selected" : ""}>${ingredient.name}
        </option>
      `).join("")}
    </optgroup>
  `;
}

const emptyIngredientOptionTemplate = `
  <option value "" disabled selected>No ingredients match search</option>
`

const unitsTemplate = `
  <optgroup label="Volume Measures">
    <option value="cups">Cups</option>
    <option value="tbsp">Tablespoons</option>
    <option value="tsp">Teaspoons</option>
    <option value="ml">Milliliters</option>
    <option value="fl_oz">Fluid Ounces</option>
    <option value="liter">Liters</option>
  </optgroup>
  <optgroup label="Weight Measures">
    <option value="grams">Grams</option>
    <option value="oz">Ounces</option>
    <option value="lb">Pounds</option>
    <option value="kg">Kilograms</option>
  </optgroup>
`;

function emptyRecipeTemplate(ingredientName) {
  return `
    <div class="recipe-empty-state">
      <div class="empty-state-icon">🍽️</div>
      <h3 class="empty-state-title">No recipes found 😔</h3>
      <p class="empty-state-message">
        We couldn't find any suggested recipes with your selected ingredient, <strong>"${ingredientName}"</strong> right now. Try selecting another ingredient!
      </p>
    </div>
  `;
}