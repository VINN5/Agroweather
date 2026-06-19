import apiClient from './client';

export const weatherApi = {
  getCurrent: async (location: string = "Nyeri") => {
    const response = await apiClient.get("/api/v1/weather/current", {
      params: { 
        location: location.trim()   // Make sure it's passed correctly
      }
    });
    return response.data;
  },

  getForecast: async (location: string = "Nyeri", days: number = 7) => {
    const response = await apiClient.get("/api/v1/weather/forecast", {
      params: { 
        location: location.trim(),
        days 
      }
    });
    return response.data;
  }
};

export const getAdvice = (
  temperature: number,
  humidity: number,
  wind_speed: number,
  condition: string,
  crop_type: string = "tea",
  lang: string = "en",
  location: string = "Nyeri"
) =>
  apiClient.post('/api/v1/advice/', {
    temperature,
    humidity,
    wind_speed,
    condition,
    crop_type,
    lang,
    location,
  });

export const getCropSuggestions = (location: string = "Nyeri") =>
  apiClient.post('/api/v1/crops/suggest', {
    location: location.trim(),
  });