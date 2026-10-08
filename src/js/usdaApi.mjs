/* eslint-disable no-useless-escape */
const API_KEY = import.meta.env.VITE_USDA_API_KEY;
const BASE_URL = "https://api.nal.usda.gov/fdc/v1";

// I'm not going to use this endpoint to simplificate my site, for now.
// Search ingredients by name
// export async function searchIngredients(query) {
//   const endpoint = `${BASE_URL}/foods/search?api_key=${API_KEY}&query=${query}&pageSize=8&dataType=Foundation,SR Legacy`;

//   if (query.trim() === "") return [];
//   try {
//     const response = await fetch(endpoint);
//     if (!response.ok) {
//       throw new Error(`Error: ${response.status} ${response.statusText}`);
//     }
//     const data = await response.json();
//     //console.log(data);
//     //console.log(searchResultsSummary(data));

//     return data;
//   } catch (error) {
//     console.error("Failed to fetch search results from USDA: ", error);
//     throw error;
//   }
// }

// Get ingredient data by ID
export async function getIngredientDetails(fdcId) {
  if (!API_KEY) {
    throw new Error("API Key is missing. Check your Render Environment configurations.");
  }

  if (!fdcId) throw new Error("A valid FDC ID is required.");
  
  const endpoint = `${BASE_URL}/food/${fdcId}?api_key=${API_KEY}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Error obtaining the details: ${response.status}`);
    }

    const foodData = await response.json();
    return foodData;
  } catch (error) {
    console.error("Failed to fetch details: ", error);
    throw error;
  }
}