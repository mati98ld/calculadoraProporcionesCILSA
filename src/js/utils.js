import { API_URL } from "src/config/api";

export const utils = {
  existeLaReceta: async (recetaName) => {
    try {
      const response = await fetch(
        `${API_URL}/recetas/?nombreReceta=` + recetaName.trim()
      );
      const data = await response.json();
      return data.nombreReceta.trim() === recetaName.trim();
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  },
};
