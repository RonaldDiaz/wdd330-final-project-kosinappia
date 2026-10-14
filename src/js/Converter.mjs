import { COMMON_INGREDIENTS, defaultIngredient } from "./data/data.mjs";
import { getIngredientDetails } from "./usdaApi.mjs";
import { getRecipesByIngredient, getRecipeDetailsById } from "./theMealDbApi.mjs";
import { parseFoodData, parseRecipes, parseRecipeDetails } from "./adapters.mjs";
import { renderWithTemplate, renderListWithTemplate, openModal } from "./ui.mjs";
import { convertAmount } from "./unitConversion.mjs";
import { notificationManager } from "./NotificationManager";
import { saveCookbookItem } from "./storage.mjs";

export default class Converter {
  constructor(elements) {
    Object.assign(this, elements);
    this.currentSearch = "";
    this.currentFilter = "all";
		this.currentIngredient = defaultIngredient;
    this.currentAmount = 1;
    this.currentFromUnit = "cups";
    this.currentToUnit = "grams";
    this.currentResult = null;
  }

  init() {
		this.populateIngredientsOptions();
		this.populateUnitOptions(this.fromUnit, this.currentFromUnit);
    this.populateUnitOptions(this.toUnit, this.currentToUnit);
    this.renderIngredient();
    this.renderResults();
    this.bindListeners();
    this.parseUrlParams();
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
      if (!selectedFdcId) {
        this.activeIngredientName.textContent = "No ingredient found";
        this.ingredientDescription.textContent =
          "Try another search term or select a different category.";
        return;
      }
      this.activeIngredientName.innerHTML = loadingTemplate;
      this.ingredientDescription.textContent = "Waiting for data."
      try {
        const ingredientData = await getIngredientDetails(selectedFdcId);
        this.currentIngredient = parseFoodData(ingredientData);
        this.currentIngredient.commonName = this.ingredientSelect.options[this.ingredientSelect.selectedIndex].text;
        this.renderIngredient();
        this.renderResults();
        this.renderRecipes();
      } catch (err) {
        notificationManager.show(`There was a problem loading ingredients: ${err.message}`, "error");
        this.activeIngredientName.textContent = "Error loading the Ingredient";
        this.ingredientDescription.textContent = "Could not load the data."
      }      
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

    // Save conversion
    this.saveToCookbook.addEventListener("click", () => {
      if (!this.currentResult) return;

      saveCookbookItem({
        fdcId: this.currentIngredient.fdcId,
        name: this.currentIngredient.commonName,
        category: this.currentIngredient.category,
        density: this.currentIngredient.density,
        gramsPerCup: this.currentIngredient.gramsPerCup,
        amount: this.currentAmount,
        fromUnit: this.currentFromUnit,
        toUnit: this.currentToUnit,
        resultValue: this.currentResult.result,
        resultUnit: this.currentResult.unit,
        practicalMeasure: this.currentResult.measure,
        grams: this.currentResult.grams,
        calories: this.currentResult.calories,
        carbs: this.currentResult.carbs,
        protein: this.currentResult.protein,
        fat: this.currentResult.fat
      });

      notificationManager.show(`Saved "${this.currentAmount} ${this.currentFromUnit} of ${this.currentIngredient.commonName}" to Cookbook!`, "success")
    });

    // Copy values to clipboard
    this.copyResultBtn.addEventListener("click", async () => {
      const copyText = `${this.currentAmount} ${this.currentFromUnit} of ${this.currentIngredient.commonName} = ${this.currentResult.result} ${this.currentResult.unit} (${this.currentResult.measure})`;
      try {
        await navigator.clipboard.writeText(copyText);
        notificationManager.show("Conversion copied to clipboard!", "success")
      } catch (err) {
        notificationManager.show(`An error has ocurred: ${err.message}`, "error");
      }
    });
  }

  renderIngredient() {
    this.activeIngredientName.textContent = this.currentIngredient.name;
    renderWithTemplate(descriptionTemplate(this.currentIngredient),this.ingredientDescription);
  }
  
  renderResults() {
    this.currentResult = convertAmount(this.currentAmount, this.currentFromUnit, this.currentToUnit, this.currentIngredient)
    this.resultNumber.textContent = this.currentResult.result;
    this.resultUnit.textContent = this.currentResult.unit;
    this.practicalMeasureValue.textContent = this.currentResult.measure;
    this.practicalMeasureNote.textContent = this.currentResult.note;
    this.formula.textContent = this.currentResult.formula;
    this.calories.textContent = this.currentResult.calories;
    this.carbs.textContent = this.currentResult.carbs;
    this.protein.textContent = this.currentResult.protein;
    this.fat.textContent = this.currentResult.fat;
  }
  
  async renderRecipes() {
    this.recipesGrid.textContent = "Loading recipes...";
    try {
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
          try {
            const recipeDetails = await getRecipeDetailsById(event.target.dataset.id);
            const parsedRecipeDetails = parseRecipeDetails(recipeDetails);
            openModal(recipeDialogTemplate(parsedRecipeDetails));
          } catch (err) {
            notificationManager.show(`There was a problem loading the recipe details: ${err.message}`, "error")
          }
        });
        this.recipesGrid.appendChild(card);
      });
    } catch (err){
      notificationManager.show(`There was a problem loading recipes: ${err.message}`, "error")
    }    
  }

  parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const ingredientId = params.get("ingredient");
    const amount = params.get("amount");
    const from = params.get("from");
    const to = params.get("to");

    if (!ingredientId || !amount || !from || !to) return;

    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) this.currentAmount = val;
  
    this.currentFromUnit = from;
    this.currentToUnit = to;

    this.amount.value = this.currentAmount;
    this.fromUnit.value = this.currentFromUnit;
    this.toUnit.value = this.currentToUnit;
    this.ingredientSelect.value = ingredientId;
    this.ingredientSelect.dispatchEvent(new Event("change")); 
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
  <option value="" disabled selected>No ingredients match search</option>
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
    <div class="empty-state">
      <img src="/images/empty_egg.webp" alt="A cracked empty egg" width="200" height="200">
      <h3>No recipes found</h3>
      <p>We couldn't find any suggested recipes with your selected ingredient, <strong>"${ingredientName}"</strong> right now. Try selecting another ingredient!</p>
    </div>
  `;
}

function recipeDialogTemplate(recipeDetails) {
  return `
    <div class="modal-inner">
      <div class="modal-header">
        <div>
          <span>${(recipeDetails.category)}</span>
          <h2 class="modal-title">${recipeDetails.title}</h2>
        </div>
        <button type="button" class="modal-close-btn" id="modalClose" aria-label="Close modal">✕</button>
      </div>      
      <div class="modal-body">
        <div>
          <img src="${recipeDetails.image}" alt="${recipeDetails.title}">
        </div>
        <p>${recipeDetails.country}</p>
        <h3>Ingredients</h3>
        <ul>${recipeDetails.ingredients.map(item => `<li>${item.measure} ${item.ingredient}</li>`).join("")}</ul>
        <h3>Recipe's Instructions</h3>
        <p>${recipeDetails.instructions}</p>       
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" id="modalDismiss">Close Recipe</button>
      </div>
    </div>
  `;
}

const loadingTemplate = `
  Loading
  <span class="loading-dots" aria-hidden="true">
    <span></span>
    <span></span>
    <span></span>
  </span>
`;