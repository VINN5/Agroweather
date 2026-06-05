import apiClient from "./client";

export const weatherApi = {
  getCurrent: async (location: string = "Nyeri") => {
    const response = await apiClient.get("/api/v1/weather/current", {
      params: { location }
    });
    return response.data;   // Return raw data to avoid strict typing conflict
  },
};
