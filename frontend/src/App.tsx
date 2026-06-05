import { useState } from "react";
import { useTranslation } from "react-i18next";
import { weatherApi } from "./api/weather";
import TreeScanner from "./components/TreeScanner";

function App() {
  const { t, i18n } = useTranslation();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"weather" | "scanner">("weather");

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "sw" : "en";
    i18n.changeLanguage(newLang);
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await weatherApi.getCurrent("Nyeri");
      setWeather(data);
      console.log("Full weather data:", data);
    } catch (err: any) {
      setError(t("errorFetch") || "Failed to fetch weather");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentHumidity = weather?.data?.hourly?.[0]?.humidity ?? "—";
  const feelsLike = weather?.data?.hourly?.[0]?.feels_like ?? "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 text-white pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-5xl font-bold tracking-tight flex items-center gap-3">
              🌱 AgroWeather
            </h1>
            <p className="text-emerald-400 text-lg mt-1">Nyeri • Kenya</p>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-medium transition-all"
          >
            {i18n.language === "en" ? "🇰🇪 Kiswahili" : "🇬🇧 English"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab("weather")}
            className={`px-6 py-3 rounded-t-2xl font-medium transition ${activeTab === "weather" ? "bg-white text-emerald-950" : "bg-white/10 hover:bg-white/20"}`}
          >
            🌤️ Weather Dashboard
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`px-6 py-3 rounded-t-2xl font-medium transition ${activeTab === "scanner" ? "bg-white text-emerald-950" : "bg-white/10 hover:bg-white/20"}`}
          >
            🌳 Tree Canopy Scanner
          </button>
        </div>

        {/* Weather Tab */}
        {activeTab === "weather" && (
          <>
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="w-full py-4 bg-white text-emerald-950 font-semibold rounded-3xl text-lg hover:bg-emerald-100 transition-all disabled:opacity-70 mb-10"
            >
              {loading ? t("fetching") : t("getWeather")}
            </button>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-2xl mb-8">
                {error}
              </div>
            )}

            {weather?.data && (
              <>
                {/* Current Weather */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-7xl font-light">{weather.data.current.temperature}°C</p>
                      <p className="text-2xl text-emerald-300 capitalize mt-2">
                        {weather.data.current.condition}
                      </p>
                    </div>
                    <img 
                      src={weather.data.current.icon} 
                      alt="weather" 
                      className="w-28 h-28 -mt-4" 
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-10">
                    <div className="bg-white/5 rounded-2xl p-5 text-center">
                      <p className="text-emerald-400 text-sm">{t("humidity")}</p>
                      <p className="text-3xl font-semibold mt-2">{currentHumidity}%</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-5 text-center">
                      <p className="text-emerald-400 text-sm">{t("windSpeed")}</p>
                      <p className="text-3xl font-semibold mt-2">{weather.data.current.wind_speed}</p>
                      <p className="text-xs text-white/60">km/h</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-5 text-center">
                      <p className="text-emerald-400 text-sm">{t("feelsLike")}</p>
                      <p className="text-3xl font-semibold mt-2">{feelsLike}°C</p>
                    </div>
                  </div>
                </div>

                {/* 7-Day Forecast */}
                {weather.data.daily && weather.data.daily.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6">{t("forecast") || "7-Day Forecast"}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      {weather.data.daily.slice(0, 7).map((day: any, index: number) => (
                        <div key={index} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 text-center border border-white/10">
                          <p className="text-emerald-300 text-sm mb-3">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </p>
                          <img 
                            src={day.icon} 
                            alt="forecast" 
                            className="w-12 h-12 mx-auto mb-3" 
                          />
                          <div className="flex justify-center gap-3 text-xl font-medium">
                            <span>{day.temp_max}°</span>
                            <span className="text-white/50">{day.temp_min}°</span>
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

        {/* Scanner Tab */}
        {activeTab === "scanner" && <TreeScanner />}
      </div>
    </div>
  );
}

export default App;