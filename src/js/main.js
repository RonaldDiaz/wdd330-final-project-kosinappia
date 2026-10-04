import { loadHeaderFooter, renderWithTemplate } from "./ui.mjs";
import { searchIngredients, getIngredientDetails } from "./usdaApi.mjs";
import { COMMON_INGREDIENTS } from "./data/data.mjs";
import { parseFoodData } from "./adapters.mjs";

loadHeaderFooter();

const searchBox = document.querySelector("#ingredient-search-input");
const searchButton = document.querySelector("#search-btn");
const ingredientSelect = document.querySelector("#ingredient-select");
const fromUnitsSelect = document.querySelector("#from-unit-select");
const toUnitsSelect = document.querySelector("#to-unit-select");

const activeIngredientElement = document.querySelector(
  "#active-ingredient-name"
);
const activeIngredientDescriptionElement = document.querySelector(
  "#active-ingredient-description"
);
const exactResultElement = document.querySelector("#result-exact-number");
const practicalResultElement = document.querySelector(
  "#practical-measure-value"
);
const calculationElement = document.querySelector("#calculation-formula");

let currentIngredient;
let currentFromUnit = "cups";
let currentToUnit = "grams";

searchButton.addEventListener("click", () => {
  getIngredientDetails(searchBox.value);
});

COMMON_INGREDIENTS.forEach((ingredient) => {
  const option = document.createElement("option");
  option.value = ingredient.fdcId;
  option.textContent = ingredient.name;
  ingredientSelect.appendChild(option);
});

ingredientSelect.addEventListener("change", async () => {
  const selectedFdcId = ingredientSelect.value;
  activeIngredientElement.textContent = "Loading...";
  const ingredientData = await getIngredientDetails(selectedFdcId);
  currentIngredient = parseFoodData(ingredientData);
  console.log(parseFoodData(ingredientData));
  activeIngredientElement.textContent = currentIngredient.name;
  renderWithTemplate(
    ingredientDescriptionTemplate(),
    activeIngredientDescriptionElement
  );
});

populateOptions(fromUnitsSelect, currentFromUnit);
populateOptions(toUnitsSelect, currentToUnit);

function populateOptions(selectItem, defaultValue) {
  selectItem.innerHTML = `
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
  selectItem.value = defaultValue;
}

function renderPage() {
  activeIngredientElement = currentIngredient;
}

function renderConversion() {
  exactResultElement.innerHTML();
}

function ingredientDescriptionTemplate() {
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
