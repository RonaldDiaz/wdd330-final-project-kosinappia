const STORAGE_KEY = "kosinappia_cookbook_v1";

export function getCookbookItems() {
  const items = localStorage.getItem(STORAGE_KEY) || "[]";
  return JSON.parse(items);
}

export function saveCookbookItem(item) {
  const current = getCookbookItems();
  const newItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...current]));
  return newItem;
}

export function deleteCookbookItem(id) {
  const updated = getCookbookItems().filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearCookbook() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

export function getCookbookStats() {
  const items = getCookbookItems();
  if (items.length === 0) return { totalSaved: 0, lastUpdated: "Never", totalGrams: 0, totalCalories: 0 };

  const latestItem = [...items].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  const lastUpdated = new Date(latestItem.timestamp).toLocaleDateString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
  
  const totalGrams = items.reduce((sum, item) => sum + (item.grams || 0), 0);
  const totalCalories = items.reduce((sum, item) => sum + (item.calories || 0), 0);

  return { totalSaved: items.length, lastUpdated, totalGrams: Math.round(totalGrams), totalCalories: Math.round(totalCalories) };
}

export function exportCookbookJSON() {
  const jsonText = JSON.stringify(getCookbookItems(), null, 2);
  const file = new Blob([jsonText], { type: "application/json" });
  const downloadAnchor = document.createElement("a");
  downloadAnchor.href = URL.createObjectURL(file);
  downloadAnchor.download = `kosinappia-cookbook-${new Date().toISOString().slice(0, 10)}.json`;
  downloadAnchor.click();
  URL.revokeObjectURL(downloadAnchor.href);
}