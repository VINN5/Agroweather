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

  const [advice, setAdvice] = useState<string>("");
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("tea");

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
      await fetchAdvice(data?.data || data, selectedCrop);
    } catch (err: any) {
      setError(t("errorFetch") || "Failed to fetch weather");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvice = async (weatherData: any, crop: string) => {
    setAdviceLoading(true);
    try {
      const response = await getAdvice(
        weatherData.current.temperature,
        weatherData.hourly?.[0]?.humidity,
        weatherData.current.wind_speed,
        weatherData.current.condition_code,
        crop,
        i18n.language
      );
      setAdvice(response?.data?.advice || "No advice available.");
    } catch (err) {
      console.error("Advice fetch failed:", err);
      setAdvice("Unable to generate advice at the moment.");
    } finally {
      setAdviceLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const currentHumidity = weather?.data?.hourly?.[0]?.humidity ?? "—";
  const currentFeelsLike = weather?.data?.hourly?.[0]?.feels_like ?? "—";

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-950 via-green-950 to-teal-950 text-white pb-12">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight flex items-center gap-3">
              🌱 AgroWeather
            </h1>
            <p className="text-emerald-400 text-base md:text-lg mt-1">Nyeri • Kenya</p>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-medium transition-all whitespace-nowrap"
          >
            {i18n.language === "en" ? "🇰🇪 Kiswahili" : "🇬🇧 English"}
          </button>
        </div>

        {/* Improved Mobile Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("weather")}
            className={`flex-1 md:flex-none px-6 py-3 rounded-t-2xl font-medium transition whitespace-nowrap text-center ${activeTab === "weather" ? "bg-white text-emerald-950" : "bg-white/10 hover:bg-white/20"}`}
          >
            {t("weatherDashboard")}
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex-1 md:flex-none px-6 py-3 rounded-t-2xl font-medium transition whitespace-nowrap text-center ${activeTab === "scanner" ? "bg-white text-emerald-950" : "bg-white/10 hover:bg-white/20"}`}
          >
            {t("treeScanner")}
          </button>
        </div>

        {activeTab === "weather" && (
          <>
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="w-full py-4 bg-white text-emerald-950 font-semibold rounded-3xl text-lg hover:bg-emerald-100 transition-all disabled:opacity-70 mb-8"
            >
              {loading ? t("refreshing") : t("refreshWeather")}
            </button>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-2xl mb-8">
                {error}
              </div>
            )}

            {weather?.data && (
              <>
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-8 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-6xl md:text-7xl font-light">{weather.data.current.temperature}°C</p>
                      <p className="text-xl md:text-2xl text-emerald-300 capitalize mt-2">
                        {weather.data.current.condition}
                      </p>
                    </div>
                    <img
                      src={weather.data.current.icon}
                      alt="weather"
                      className="w-24 h-24 md:w-28 md:h-28 -mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 md:gap-4 mt-8">
                    <div className="bg-white/5 rounded-2xl p-4 md:p-5 text-center">
                      <p className="text-emerald-400 text-sm">{t("humidity")}</p>
                      <p className="text-2xl md:text-3xl font-semibold mt-2">{currentHumidity}%</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 md:p-5 text-center">
                      <p className="text-emerald-400 text-sm">{t("windSpeed")}</p>
                      <p className="text-2xl md:text-3xl font-semibold mt-2">
                        {weather.data.current.wind_speed} <span className="text-xs md:text-sm font-normal">km/h</span>
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 md:p-5 text-center">
                      <p className="text-emerald-400 text-sm">{t("feelsLike")}</p>
                      <p className="text-2xl md:text-3xl font-semibold mt-2">{currentFeelsLike}°C</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {["tea", "coffee", "maize", "horticulture", "general"].map((crop) => (
                      <button
                        key={crop}
                        onClick={() => {
                          setSelectedCrop(crop);
                          if (weather?.data) fetchAdvice(weather.data, crop);
                        }}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition capitalize
                          ${selectedCrop === crop
                            ? "bg-emerald-600 text-white"
                            : "bg-white/10 hover:bg-white/20"}`}
                      >
                        {crop}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 bg-emerald-900/30 border border-emerald-700/40 rounded-2xl p-5 md:p-6">
                    <p className="text-emerald-400 text-xs mb-3 font-medium">
                      🌾 {t("aiAdvisory")} — {selectedCrop.toUpperCase()}
                    </p>
                    {adviceLoading ? (
                      <p className="text-sm text-white/50">Generating advice...</p>
                    ) : (
                      <p className="text-sm leading-relaxed text-emerald-100 whitespace-pre-line">
                        {advice || "Click a crop above to get personalized AI farming advice."}
                      </p>
                    )}
                  </div>
                </div>

                {weather.data.daily && weather.data.daily.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 px-1">{t("forecast")}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 md:gap-4">
                      {weather.data.daily.slice(0, 7).map((day: any, index: number) => (
                        <div key={index} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10">
                          <p className="text-emerald-300 text-sm mb-2">
                            {new Date(day.date).toLocaleDateString(
                              i18n.language === "sw" ? "sw-KE" : "en-US", 
                              { weekday: "short" }
                            )}
                          </p>
                          <img
                            src={day.icon}
                            alt="forecast"
                            className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3"
                          />
                          <div className="flex justify-center gap-2 text-lg font-medium">
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

        {activeTab === "scanner" && <TreeScanner />}
      </div>
    </div>
  );
}

export default App;