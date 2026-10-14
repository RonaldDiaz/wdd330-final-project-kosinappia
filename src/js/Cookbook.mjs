import { notificationManager } from "./NotificationManager";
import { getCookbookItems, getCookbookStats, deleteCookbookItem, exportCookbookJSON, clearCookbook } from "./storage.mjs";
import { renderWithTemplate } from "./ui.mjs";

export default class Cookbook {
  constructor(elements) {
    Object.assign(this, elements);
  }

  init() {
    this.bindEvents();
    this.renderCookbook();
  }

  bindEvents() {
    this.exportJsonBtn.addEventListener("click", () => {
      exportCookbookJSON();
      notificationManager.show("Exported cookbook library as JSON!", "success");
    });

    this.printCardBtn.addEventListener("click", () => {
      window.print();
    });

    this.clearAllBtn.addEventListener("click", () => {
      const items = getCookbookItems();
      if (items.length === 0) {
        notificationManager.show("Cookbook is already empty!", "warning");
        return;
      }
      if (confirm("Are you sure you want to clear all saved conversions? This cannot be undone.")) {
        clearCookbook();
        this.renderCookbook();
        notificationManager.show("Cookbook cleared sucessfully.", "success");
      }
    });
  }

  renderCookbook() {    
    const items = getCookbookItems();
    const stats = getCookbookStats();

    this.statTotalSaved.textContent = stats.totalSaved;
    this.statLastUpdated.textContent = stats.lastUpdated;
    this.statTotalGrams.textContent = `${stats.totalGrams} g`;
    this.statTotalCalories.textContent = `${stats.totalCalories} kcal`;

    this.cookbookMainList.innerHTML = "";

    if (items.length === 0) {
      renderWithTemplate(emptyStateTemplate, this.cookbookMainList);
      return;
    }    

    items.forEach(item => {
      const card = document.createElement("article");
      card.className = "cookbook-card";
      card.id = `cookbook-card-${item.id}`;
      const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

      renderWithTemplate(cookbookCardTemplate(item, dateStr), card);

      // Copy values
      card.querySelector(".btn-copy-item").addEventListener("click", async () => {
        const copyText = `${item.amount} ${item.fromUnit} of ${item.name} = ${item.resultValue} ${item.resultUnit} (${item.practicalMeasure})`;
        try {
          await navigator.clipboard.writeText(copyText);
          notificationManager.show("Conversion copied to clipboard!", "success")
        } catch (err) {
          notificationManager.show(`An error has ocurred: ${err.message}`, "error");
        }
      });

      // Delete item
      card.querySelector(".btn-delete-item").addEventListener("click", () => {
        deleteCookbookItem(item.id);
        this.renderCookbook();
        notificationManager.show(`Removed ${item.name} conversion`, "success");
      });

      this.cookbookMainList.appendChild(card);
    });
  }
}

const emptyStateTemplate = `
  <div class="empty-state">
    <img src="/images/empty_egg.webp" alt="A cracked empty egg" width="200" height="200">
    <h3>Your Cookbook is Empty</h3>
    <p>Convert ingredients on the main converter and click "Save to Cookbook" to build your custom ingredient reference card.</p>
    <a href="/" class="btn btn-tertiary">Open Unit Converter</a>
  </div>
`;

function cookbookCardTemplate(item, dateStr) {
  return `
    <div class="cookbook-card-top">
      <div>
        <p>${item.name}</p>
        <div class="cookbook-item-meta">
          <span>${item.category}</span>
          <span aria-hidden="true">·</span>
          <span>Saved ${dateStr}</span>
        </div>
      </div>
      <div class="cookbook-item-result">
        <div class="cookbook-item-result-value">
          ${item.resultValue} <span>${item.resultUnit}</span>
        </div>
        <div class="cookbook-item-result-from">
          from ${item.amount} ${item.fromUnit}
        </div>
      </div>
    </div>
    <div class="cookbook-metrics-grid">
      <div>
        <div class="metric-label">USDA Verified Density</div>
        <div class="metric-val">${item.density} g/ml</div>
      </div>
      <div>
        <div class="metric-label">Total calories</div>
        <div class="metric-val">${item.calories} kcal</div>
      </div>
      <div>
        <div class="metric-label">Practical Measure</div>
        <div class="metric-val">${item.practicalMeasure}</div>
      </div>
    </div>
    <div class="cookbook-card-actions">
    <a href="/?ingredient=${item.fdcId}&amount=${item.amount}&from=${item.fromUnit}&to=${item.toUnit}" class="btn btn-tertiary">
      <img src="/images/back.svg" alt="Back icon" width="14" height="14"/>Load in Converter
    </a>
    <div class="group-actions">
      <button type="button" class="btn btn-secondary btn-copy-item" data-id="${item.id}">
        <img src="/images/copy.svg" alt="Copy icon" width="14" height="14"/>Copy
      </button>
      <button type="button" class="btn btn-danger btn-delete-item" data-id="${item.id}" aria-label="Delete ${item.name}">
        <img src="/images/delete.svg" alt="Delete icon" width="14" height="14"/>Delete
      </button>
    </div>
    </div>
  `;
}