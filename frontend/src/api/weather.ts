import apiClient from './client';

export const weatherApi = {
  getCurrent: async (location: string = "Nyeri") => {
    const response = await apiClient.get("/api/v1/weather/current", {
      params: { location }
    });
    return response.data;
  },
};

export const getAdvice = (
  temperature: number,
  humidity: number,
  wind_speed: number,
  condition: string,
  crop_type: string = "tea",
  lang: string = "en"
) =>
  apiClient.post('/api/v1/advice/', {
    temperature,
    humidity,
    wind_speed,
    condition,
    crop_type,
    lang,
  });