export const UNITS = {
  cups: { id: "cups", name: "Cups (US Standard)", shortName: "cup", type: "volume", toBase: 236.5882365 },
  tbsp: { id: "tbsp", name: "Tablespoons (tbsp)", shortName: "tbsp", type: "volume", toBase: 14.7867648 },
  tsp: { id: "tsp", name: "Teaspoons (tsp)", shortName: "tsp", type: "volume", toBase: 4.9289216 },
  ml: { id: "ml", name: "Milliliters (ml)", shortName: "ml", type: "volume", toBase: 1.0 },
  fl_oz: { id: "fl_oz", name: "Fluid Ounces (fl oz)", shortName: "fl oz", type: "volume", toBase: 29.5735296 },
  liter: { id: "liter", name: "Liters (L)", shortName: "L", type: "volume", toBase: 1000.0 },
  grams: { id: "grams", name: "Grams (g)", shortName: "g", type: "weight", toBase: 1.0 },
  oz: { id: "oz", name: "Ounces (oz)", shortName: "oz", type: "weight", toBase: 28.349523125 },
  lb: { id: "lb", name: "Pounds (lb)", shortName: "lb", type: "weight", toBase: 453.59237 },
  kg: { id: "kg", name: "Kilograms (kg)", shortName: "kg", type: "weight", toBase: 1000.0 }
}

export function convertAmount(amount, fromUnitName, toUnitName, ingredient) {
  const fromUnit = UNITS[fromUnitName];
  const toUnit = UNITS[toUnitName];

  let milliliters = 0;
  let grams = 0;

  if (fromUnit.type === "volume") {
    milliliters = amount * fromUnit.toBase;
    grams = milliliters * ingredient.density;
  } else {
    grams = amount * fromUnit.toBase;
    milliliters = ingredient.density > 0 ? grams / ingredient.density : 0;
  }

  let exactValue = 0;
  if (toUnit.type === "volume") {
    exactValue = milliliters / toUnit.toBase;
  } else {
    exactValue = grams / toUnit.toBase;
  }

  let formulaDescription = "";
  if (fromUnit.type === "volume" && toUnit.type === "weight") {
    formulaDescription = `${amount} ${fromUnit.shortName} × ${fromUnit.toBase.toFixed(2)} ml × ${ingredient.density} g/ml = ${exactValue.toFixed(2)} ${toUnit.shortName}`;
  } else if (fromUnit.type === "weight" && toUnit.type === "volume") {
    formulaDescription = `${amount} ${fromUnit.shortName} ÷ ${ingredient.density} g/ml ÷ ${toUnit.toBase.toFixed(2)} ml = ${exactValue.toFixed(2)} ${toUnit.shortName}`;
  } else {
    formulaDescription = "Direct conversion, no density needed";
  }

  const calories = Math.round(ingredient.nutrients.calories * (grams / 100.0));
  const carbs = Math.round(ingredient.nutrients.carbs * (grams / 100.0) * 10) / 10;
  const protein = Math.round(ingredient.nutrients.protein * (grams / 100.0) * 10) / 10;
  const fat = Math.round(ingredient.nutrients.fat * (grams / 100.0) * 10) / 10;

  const { measure, measureNote } = practicalMeasure(milliliters, grams, ingredient);

  return { result: exactValue.toFixed(2), unit: toUnit.shortName, measure: measure, note: measureNote, formula: formulaDescription, calories: calories, carbs: carbs, protein: protein, fat: fat };
}

export function practicalMeasure(totalMl, totalGrams, ingredient) {
  if (totalMl <= 0.05 || totalGrams <= 0.05) {
    return { practicalMeasure: "0", practicalMeasureNote: "Enter an amount above 0" };
  }

  const mlPerCup = UNITS.cups.toBase;
  const mlPerTbsp = UNITS.tbsp.toBase;
  const mlPerTsp = UNITS.tsp.toBase;

  // parts: cups, tablespoons and teaspoons
  const parts = [];
  let remainingMl = totalMl;

  // Whole cups:
  const wholeCups = Math.floor(remainingMl / mlPerCup);
  if (wholeCups > 0) {
    remainingMl -= wholeCups * mlPerCup;
  }

  // Fraction cup:
  const commonFractions = [
    { fraction: "3/4", value: 0.75 * mlPerCup },
    { fraction: "2/3", value: (2 / 3) * mlPerCup },
    { fraction: "1/2", value: 0.5 * mlPerCup },
    { fraction: "1/3", value: (1 / 3) * mlPerCup },
    { fraction: "1/4", value: 0.25 * mlPerCup }
  ];

  const match = commonFractions.find(item => remainingMl >= item.value - mlPerTsp);

  let matchedFraction = "";

  if (match) {
    matchedFraction = match.fraction;
    remainingMl -= match.value;
  }

  // Cups + fraction
  if (wholeCups > 0 && matchedFraction) {
    parts.push(`${wholeCups} ${matchedFraction} cup`);
  } else if (wholeCups > 0) {
    parts.push(`${wholeCups} cup${wholeCups > 1 ? "s" : ""}`);
  } else if (matchedFraction) {
    parts.push(`${matchedFraction} cup`);
  }

  // Tablespoons
  if (remainingMl >= mlPerTbsp - (0.5 * mlPerTsp)) {
    const wholeTbsp = Math.floor((remainingMl + 0.1) / mlPerTbsp);
    if (wholeTbsp > 0) {
      parts.push(`${wholeTbsp} tbsp`);
      remainingMl -= wholeTbsp * mlPerTbsp;
    }
  }

  // Teaspoons (rounded each 1/2 tsp)
  if (remainingMl >= mlPerTsp - 1.0) {
    const tspVal = remainingMl / mlPerTsp;
    if (tspVal >= 1.75) {
      parts.push("2 tsp");
    } else if (tspVal >= 1.25) {
      parts.push("1 1/2 tsp");
    } else if (tspVal >= 0.75) {
      parts.push("1 tsp");
    } else if (tspVal >= 0.35) {
      parts.push("1/2 tsp");
    } else if (tspVal >= 0.15) {
      parts.push("1/4 tsp");
    }
  } else if (remainingMl > 1.2 && parts.length === 0) {
    parts.push("pinch");
  }

  const measure = parts.length > 0 ? parts.join(" + ") : "1 pinch";
  const measureNote = `Kitchen measures breakdown for ${ingredient.name} (~${ingredient.gramsPerCup} g/cup)`;

  return { measure, measureNote };
}