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

      // Crop Disease Detector
      diseaseScanner: 'Crop Disease Detector',
      uploadCropPhoto: 'Upload a Leaf or Crop Photo',
      cropTypePlaceholder: 'Crop type (e.g. maize, tomato) — optional',
      notesPlaceholder: 'Notes for the AI — optional',
      clickOrDragLeaf: 'Click or drag a leaf/crop photo here',
      analyzeCrop: 'Analyze Crop',
      cropIdentified: 'Crop Identified',
      affectedArea: 'Affected Area',
      diseaseDetected: 'Disease Detected',
      cropLooksHealthy: 'No disease detected — crop looks healthy',
      severity: 'Severity',
      urgency: 'Urgency',
      symptoms: 'Symptoms Observed',
      likelyCauses: 'Likely Causes',
      treatmentRecommendations: 'Treatment Recommendations',
      organicRemedies: 'Organic & Low-Cost Remedies',
      preventionTips: 'Prevention Tips for Next Season',
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

      // Kigunduzi cha Magonjwa ya Mimea
      diseaseScanner: 'Kigunduzi cha Magonjwa ya Mimea',
      uploadCropPhoto: 'Pakia Picha ya Jani au Mmea',
      cropTypePlaceholder: 'Aina ya mmea (mf. mahindi, nyanya) — hiari',
      notesPlaceholder: 'Maelezo kwa AI — hiari',
      clickOrDragLeaf: 'Bofya au buruta picha ya jani/mmea hapa',
      analyzeCrop: 'Chambua Mmea',
      cropIdentified: 'Mmea Uliotambuliwa',
      affectedArea: 'Sehemu Iliyoathirika',
      diseaseDetected: 'Ugonjwa Umegundulika',
      cropLooksHealthy: 'Hakuna ugonjwa uliogundulika — mmea ni mzima',
      severity: 'Ukali',
      urgency: 'Uharaka',
      symptoms: 'Dalili Zilizoonekana',
      likelyCauses: 'Sababu Zinazowezekana',
      treatmentRecommendations: 'Mapendekezo ya Matibabu',
      organicRemedies: 'Tiba za Asili na za Gharama Nafuu',
      preventionTips: 'Vidokezo vya Kuzuia Msimu Ujao',
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