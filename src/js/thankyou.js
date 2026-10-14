import { loadHeaderFooter } from "./ui.mjs";

loadHeaderFooter();

const params = new URLSearchParams(window.location.search);
const firstName = params.get("firstName");
const lastName = params.get("lastName");
const email = params.get("email");
const ingredientName = params.get("ingredientName");
const category = params.get("category");
const notes = params.get("notes") || "No special notes specified.";
const timestamp = params.get("timestamp") || new Date().toISOString();

const fullName = `${firstName} ${lastName}`.trim();

const receiptContainer = document.querySelector("#receiptDetails");
receiptContainer.innerHTML = `
  <div class="receipt-row">
    <span class="receipt-label">Requested Ingredient</span>
    <span class="receipt-val">${ingredientName}</span>
  </div>
  <div class="receipt-row">
    <span class="receipt-label">Ingredient Category</span>
    <span class="receipt-val">${category}</span>
  </div>
  <div class="receipt-row">
    <span class="receipt-label">Submitted By</span>
    <span class="receipt-val">${fullName}</span>
  </div>
  <div class="receipt-row">
    <span class="receipt-label">Contact Email</span>
    <span class="receipt-val">${email}</span>
  </div>
  <div class="receipt-row">
    <span class="receipt-label">Submission Timestamp</span>
    <span class="receipt-val">${timestamp}</span>
  </div>
  <div class="receipt-row">
    <span class="receipt-label">Aditional Notes</span>
    <span class="receipt-val">${notes}</span>
  </div>
`;
