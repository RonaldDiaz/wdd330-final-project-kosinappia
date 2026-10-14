import { loadHeaderFooter } from "./ui.mjs";
import Request from "./Request.mjs";

loadHeaderFooter();

const idList = ["ingredientRequestForm", "timestamp", "faqContainer"];
const elements = Object.fromEntries(
  idList.map((id) => [id, document.getElementById(id)])
);

const request = new Request(elements);
request.init();
