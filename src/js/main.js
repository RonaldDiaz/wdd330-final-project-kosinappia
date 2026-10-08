import { loadHeaderFooter } from "./ui.mjs";
import Converter from "./Converter.mjs";

loadHeaderFooter();

const idList = ["ingredientSearchInput", "searchClearBtn", "activeIngredientName", "ingredientSelect", "ingredientDescription", "fromUnit", "toUnit", "swapUnits", "amount", "resultNumber", "resultUnit", "practicalMeasureValue", "practicalMeasureNote", "formula", "calories", "carbs", "protein", "fat", "recipesGrid"];

const elements = Object.fromEntries(idList.map(id => [id, document.getElementById(id)]))
elements.filterBtns = document.querySelectorAll(".filter-btn");
elements.presetBtns = document.querySelectorAll(".preset-btn");

const converter = new Converter(elements);
converter.init();