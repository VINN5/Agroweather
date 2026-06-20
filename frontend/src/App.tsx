import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { weatherApi, getAdvice } from "./api/weather";
import TreeScanner from "./components/TreeScanner";

function App() {
  const { t, i18n } = useTranslation();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"weather" | "scanner">("weather");
  const [searchQuery, setSearchQuery] = useState("Nyeri");

  const [advice, setAdvice] = useState<string>("");
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [recommendedCrops, setRecommendedCrops] = useState<string[]>(["maize", "horticulture", "general"]);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "sw" : "en";
    i18n.changeLanguage(newLang);
  };

  const fetchWeather = async (location: string = searchQuery) => {
    const trimmed = location.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    try {
      const data = await weatherApi.getCurrent(trimmed);
      setWeather(data);
      setAdvice("");
      setSelectedCrop(null);
      fetchRecommendedCrops(trimmed);
    } catch (err: any) {
      setError(`Could not find "${trimmed}". Try "Mombasa", "Nairobi", "Kisumu"`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedCrops = async (location: string) => {
    try {
      const res = await fetch('/api/v1/crops/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      });
      if (res.ok) {
        const result = await res.json();
        setRecommendedCrops(result.crops || ["maize", "horticulture", "general"]);
      }
    } catch (err) {
      console.error("Crop suggestions failed:", err);
    }
  };

  const fetchAdvice = async (weatherData: any, crop: string) => {
    setAdviceLoading(true);
    try {
      const current = weatherData?.current || weatherData?.data?.current || {};
      const response = await getAdvice(
        current.temp_c || current.temp,
        current.humidity,
        current.wind_kph || current.wind_speed,
        current.condition?.text || current.condition,
        crop,
        i18n.language
      );
      setAdvice(response?.data?.advice || "No advice available.");
    } catch (err) {
      console.error(err);
      setAdvice("Unable to generate advice at the moment.");
    } finally {
      setAdviceLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const currentData = weather?.data?.current || weather?.current || {};
  const forecastData = weather?.data?.forecast?.forecastday || weather?.forecast?.forecastday || [];

  const currentHumidity = currentData.humidity ?? "—";
  const currentFeelsLike = currentData.feelslike_c ?? currentData.feels_like ?? "—";
  const conditionText = currentData.condition?.text || "Unknown";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 text-white pb-12">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">

        <div className="flex items-start justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight flex items-center gap-3">
              🌱 AgroWeather
            </h1>
            <p className="text-emerald-400 text-sm md:text-lg mt-1">Kenya Weather Dashboard</p>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-medium transition-all whitespace-nowrap"
          >
            {i18n.language === "en" ? "🇰🇪 Kiswahili" : "🇬🇧 English"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location (e.g. Mombasa, Nairobi...)"
            className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-3xl text-white placeholder-white/50 focus:outline-none focus:border-emerald-400"
            onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
          />
          <button
            onClick={() => fetchWeather()}
            disabled={loading}
            className="px-8 py-3 bg-white text-emerald-950 font-semibold rounded-3xl hover:bg-emerald-100 transition-all disabled:opacity-70 whitespace-nowrap"
          >
            Search
          </button>
        </div>

        <div className="flex gap-2 mb-6 md:mb-8 border-b border-white/10 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("weather")}
            className={`flex-1 px-6 py-3 rounded-t-2xl font-medium transition text-center ${activeTab === "weather" ? "bg-white text-emerald-950" : "bg-white/10 hover:bg-white/20"}`}
          >
            {t("weatherDashboard")}
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex-1 px-6 py-3 rounded-t-2xl font-medium transition text-center ${activeTab === "scanner" ? "bg-white text-emerald-950" : "bg-white/10 hover:bg-white/20"}`}
          >
            {t("treeScanner")}
          </button>
        </div>

        {activeTab === "weather" && (
          <>
            <button
              onClick={() => fetchWeather()}
              disabled={loading}
              className="w-full py-4 bg-white text-emerald-950 font-semibold rounded-3xl text-lg hover:bg-emerald-100 transition-all disabled:opacity-70 mb-8"
            >
              {loading ? "Loading..." : "Refresh Weather"}
            </button>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-2xl mb-8">
                {error}
              </div>
            )}

            {weather && (
              <>
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 mb-8 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-5xl sm:text-6xl md:text-7xl font-light">
                        {currentData.temp_c || currentData.temp}°C
                      </p>
                      <p className="text-lg md:text-2xl text-emerald-300 capitalize mt-1">
                        {conditionText}
                      </p>
                    </div>
                    <img
                      src={currentData.condition?.icon?.startsWith('//') 
                        ? `https:${currentData.condition.icon}` 
                        : currentData.condition?.icon}
                      alt="weather"
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 -mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-8">
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <p className="text-emerald-400 text-sm">{t("humidity")}</p>
                      <p className="text-2xl font-semibold mt-1">{currentHumidity}%</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <p className="text-emerald-400 text-sm">{t("windSpeed")}</p>
                      <p className="text-2xl font-semibold mt-1">
                        {currentData.wind_kph || currentData.wind_speed} <span className="text-xs">km/h</span>
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <p className="text-emerald-400 text-sm">{t("feelsLike")}</p>
                      <p className="text-2xl font-semibold mt-1">{currentFeelsLike}°C</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {recommendedCrops.map((crop) => (
                      <button
                        key={crop}
                        onClick={() => {
                          setSelectedCrop(crop);
                          fetchAdvice(weather?.data || weather, crop);
                        }}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition capitalize ${selectedCrop === crop ? "bg-emerald-600 text-white" : "bg-white/10 hover:bg-white/20"}`}
                      >
                        {crop}
                      </button>
                    ))}
                  </div>

                  {selectedCrop && (
                    <div className="mt-6 bg-emerald-900/30 border border-emerald-700/40 rounded-2xl p-5 md:p-6">
                      <p className="text-emerald-400 text-xs mb-3 font-medium">
                        🌾 {t("aiAdvisory")} — {selectedCrop.toUpperCase()} in {searchQuery}
                      </p>
                      {adviceLoading ? (
                        <p className="text-sm text-white/50">Generating advice...</p>
                      ) : (
                        <p className="text-sm leading-relaxed text-emerald-100 whitespace-pre-line">
                          {advice}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 7-DAY FORECAST - FULLY RESTORED */}
                {forecastData.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 px-1">{t("forecast")}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 md:gap-4">
                      {forecastData.slice(0, 7).map((day: any, index: number) => (
                        <div key={index} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10">
                          <p className="text-emerald-300 text-sm mb-2">
                            {new Date(day.date).toLocaleDateString(
                              i18n.language === "sw" ? "sw-KE" : "en-US", 
                              { weekday: "short" }
                            )}
                          </p>
                          <img
                            src={day.day?.condition?.icon?.startsWith('//') 
                              ? `https:${day.day.condition.icon}` 
                              : day.day?.condition?.icon}
                            alt="forecast"
                            className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3"
                          />
                          <div className="flex justify-center gap-2 text-lg font-medium">
                            <span>{day.day?.maxtemp_c}°</span>
                            <span className="text-white/50">{day.day?.mintemp_c}°</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "scanner" && <TreeScanner />}
      </div>
    </div>
  );
}

export default App;