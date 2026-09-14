import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { diseaseApi } from "../api/disease";

interface DiseaseResult {
  crop_identified?: string;
  disease_detected?: boolean;
  disease_name?: string;
  confidence_score?: number;
  severity?: string;
  urgency?: string;
  affected_area_pct?: number;
  symptoms?: string[];
  likely_causes?: string[];
  treatment_recommendations?: string[];
  organic_remedies?: string[];
  prevention_tips?: string[];
  original_image_url?: string;
}

const severityStyles: Record<string, string> = {
  none: "bg-emerald-500/20 border-emerald-500 text-emerald-200",
  mild: "bg-yellow-500/20 border-yellow-500 text-yellow-200",
  moderate: "bg-orange-500/20 border-orange-500 text-orange-200",
  severe: "bg-red-500/20 border-red-500 text-red-200",
};

const urgencyStyles: Record<string, string> = {
  low: "bg-emerald-600 text-white",
  medium: "bg-yellow-500 text-emerald-950",
  high: "bg-red-600 text-white",
};

export default function DiseaseScanner() {
  const { t } = useTranslation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cropType, setCropType] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File size must be less than 20MB");
      return;
    }
    setSelectedFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const analyzeDisease = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError("");
    try {
      const response = await diseaseApi.analyze(selectedFile, cropType, "Nyeri", notes);
      const actualResult = response?.data?.data || response?.data || response;
      setResult(actualResult);
    } catch (err: any) {
      const raw = JSON.stringify(err?.response?.data || err?.message || "");
      if (raw.includes("quota") || raw.includes("upgrade") || raw.includes("429")) {
        setError("Disease detection quota exceeded on free plan. Quota resets monthly.");
      } else {
        setError("Failed to analyze image. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    if (preview) URL.revokeObjectURL(preview);
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setCropType("");
    setNotes("");
  };

  const severityKey = (result?.severity || "").toLowerCase();
  const urgencyKey = (result?.urgency || "").toLowerCase();

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 border border-white/10">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{t("diseaseScanner")}</h2>
      <p className="text-emerald-400 text-sm sm:text-base mb-6 md:mb-8">{t("uploadCropPhoto")}</p>

      {!result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <input
              type="text"
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              placeholder={t("cropTypePlaceholder")}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
            />
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center mb-6 transition-all duration-200 cursor-pointer
              ${dragActive ? "border-emerald-400 bg-emerald-500/10" : "border-white/30 hover:border-emerald-400"}`}
            onClick={() => document.getElementById("disease-upload")?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="disease-upload"
            />
            {preview ? (
              <img src={preview} alt="preview" className="max-h-64 mx-auto rounded-xl shadow-xl" />
            ) : (
              <div>
                <div className="text-5xl sm:text-6xl mb-4">🍃</div>
                <p className="text-base sm:text-xl font-medium">{t("clickOrDragLeaf")}</p>
                <p className="text-emerald-400 text-xs sm:text-sm mt-2">JPEG, PNG, WEBP • Max 20MB</p>
              </div>
            )}
          </div>

          <button
            onClick={analyzeDisease}
            disabled={!selectedFile || loading}
            className="w-full py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/10 font-semibold rounded-2xl text-base sm:text-lg transition disabled:cursor-not-allowed"
          >
            {loading ? t("analyzing") : t("analyzeCrop")}
          </button>
        </>
      )}

      {error && (
        <div className="bg-amber-500/20 border border-amber-500 text-amber-200 p-4 sm:p-5 rounded-2xl mt-6 text-center text-sm sm:text-base">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6 md:space-y-8 mt-2">
          {/* Thumbnail + top-line metrics together so the image doesn't eat a full screen */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            {preview && (
              <img
                src={preview}
                alt="analyzed crop"
                className="w-full sm:w-40 h-40 object-cover rounded-2xl shadow-lg flex-shrink-0"
              />
            )}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 w-full">
              <div className="bg-white/5 rounded-2xl p-3 sm:p-4 text-center">
                <p className="text-emerald-400 text-xs">{t("cropIdentified")}</p>
                <p className="text-sm sm:text-lg font-bold mt-1 capitalize truncate">
                  {result.crop_identified ?? "—"}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 sm:p-4 text-center">
                <p className="text-emerald-400 text-xs">Confidence</p>
                <p className="text-lg sm:text-2xl font-bold mt-1">
                  {result.confidence_score ? `${(result.confidence_score * 100).toFixed(0)}%` : "—"}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 sm:p-4 text-center">
                <p className="text-emerald-400 text-xs">{t("affectedArea")}</p>
                <p className="text-lg sm:text-2xl font-bold mt-1">
                  {result.affected_area_pct != null ? `${result.affected_area_pct.toFixed(0)}%` : "—"}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`border rounded-2xl p-4 sm:p-6 text-center ${
              severityStyles[severityKey] || "bg-white/5 border-white/20 text-white"
            }`}
          >
            {result.disease_detected ? (
              <>
                <p className="text-xs sm:text-sm uppercase tracking-wide mb-1">{t("diseaseDetected")}</p>
                <p className="text-xl sm:text-2xl font-bold mb-2">{result.disease_name || "Unidentified issue"}</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {result.severity && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/20 capitalize">
                      {t("severity")}: {result.severity}
                    </span>
                  )}
                  {result.urgency && (
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                        urgencyStyles[urgencyKey] || "bg-white/20"
                      }`}
                    >
                      {t("urgency")}: {result.urgency}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-lg sm:text-xl font-semibold">✅ {t("cropLooksHealthy")}</p>
            )}
          </div>

          {/* Symptoms + Causes side-by-side on larger screens to cut scroll length */}
          {((result.symptoms && result.symptoms.length > 0) ||
            (result.likely_causes && result.likely_causes.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.symptoms && result.symptoms.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
                    🔍 {t("symptoms")}
                  </h3>
                  <ul className="space-y-2">
                    {result.symptoms.map((s: string, i: number) => (
                      <li key={i} className="bg-white/5 rounded-2xl p-3 text-sm">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.likely_causes && result.likely_causes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
                    🧪 {t("likelyCauses")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.likely_causes.map((c: string, i: number) => (
                      <span key={i} className="bg-white/10 rounded-full px-4 py-2 text-xs sm:text-sm capitalize">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Treatment + Organic remedies side-by-side */}
          {((result.treatment_recommendations && result.treatment_recommendations.length > 0) ||
            (result.organic_remedies && result.organic_remedies.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.treatment_recommendations && result.treatment_recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
                    💊 {t("treatmentRecommendations")}
                  </h3>
                  <ul className="space-y-2">
                    {result.treatment_recommendations.map((rec: string, i: number) => (
                      <li key={i} className="bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-3 text-sm">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.organic_remedies && result.organic_remedies.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
                    🌿 {t("organicRemedies")}
                  </h3>
                  <ul className="space-y-2">
                    {result.organic_remedies.map((rem: string, i: number) => (
                      <li key={i} className="bg-teal-900/20 border border-teal-700/30 rounded-2xl p-3 text-sm">
                        {rem}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {result.prevention_tips && result.prevention_tips.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
                🛡️ {t("preventionTips")}
              </h3>
              <ul className="space-y-2">
                {result.prevention_tips.map((tip: string, i: number) => (
                  <li key={i} className="bg-white/5 rounded-2xl p-3 text-sm">• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={resetScan}
            className="w-full py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 font-semibold rounded-2xl text-base sm:text-lg transition"
          >
            {t("scanAnother")}
          </button>
        </div>
      )}
    </div>
  );
}
