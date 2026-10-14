import { loadHeaderFooter } from "./ui.mjs";
import Cookbook from "./Cookbook.mjs";

loadHeaderFooter();

const idList = [
  "cookbookMainList",
  "statTotalSaved",
  "statLastUpdated",
  "statTotalGrams",
  "statTotalCalories",
  "exportJsonBtn",
  "printCardBtn",
  "clearAllBtn",
];

const elements = Object.fromEntries(
  idList.map((id) => [id, document.getElementById(id)])
);

const cookbook = new Cookbook(elements);
cookbook.init();
