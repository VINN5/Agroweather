import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      title: 'AgroWeather',
      subtitle: 'Nyeri • Kenya',
      getWeather: 'Get Current Weather',
      fetching: 'Fetching...',
      humidity: 'Humidity',
      windSpeed: 'Wind Speed',
      feelsLike: 'Feels Like',
      forecast: '7-Day Forecast',
      canopyScanner: 'Tree Canopy Scanner',
      uploadImage: 'Upload Farm Image',
      analyzing: 'Analyzing...',
      analyze: 'Analyze Canopy',
      treeCount: 'Trees Detected',
      canopyCoverage: 'Canopy Coverage',
      recommendations: 'Recommendations',
      errorFetch: 'Failed to fetch weather data',
      errorAnalyze: 'Failed to analyze image',

      
      weatherDashboard: 'Weather Dashboard',
      treeScanner: 'Tree Canopy Scanner',
      refreshWeather: 'Refresh Weather',
      refreshing: 'Refreshing...',
      aiAdvisory: 'AI FARMING ADVISORY',
    }
  },
  sw: {
    translation: {
      title: 'AgroWeather',
      subtitle: 'Nyeri • Kenya',
      getWeather: 'Pata Hali ya Hewa',
      fetching: 'Inapakia...',
      humidity: 'Unyevu',
      windSpeed: 'Kasi ya Upepo',
      feelsLike: 'Hisia ya Joto',
      forecast: 'Utabiri wa Siku 7',
      canopyScanner: 'Skana ya Miti',
      uploadImage: 'Pakia Picha ya Shamba',
      analyzing: 'Inachambua...',
      analyze: 'Chambua Miti',
      treeCount: 'Miti Iliyopatikana',
      canopyCoverage: 'Usafi wa Matawi',
      recommendations: 'Mapendekezo',
      errorFetch: 'Imeshindwa kupata data ya hali ya hewa',
      errorAnalyze: 'Imeshindwa kuchambua picha',

      // Added for App.tsx
      weatherDashboard: 'Dashibodi ya Hali ya Hewa',
      treeScanner: 'Skana ya Miti',
      refreshWeather: 'Sasisha Hali ya Hewa',
      refreshing: 'Inasasisha...',
      aiAdvisory: 'USHAURI WA KILIMO KWA AI',
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })

export default i18n