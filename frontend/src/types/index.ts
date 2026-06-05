export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  wind_speed: number;
  // Add more fields based on your backend schemas
}

export interface ForecastDay {
  date: string;
  temperature_max: number;
  temperature_min: number;
  condition: string;
}

export interface TreeAnalysis {
  canopy_cover: number;
  tree_count: number;
  health_score: number;
  recommendations: string[];
  // Add more as per your trees.py schema
}

export interface ApiError {
  message: string;
  status?: number;
}
