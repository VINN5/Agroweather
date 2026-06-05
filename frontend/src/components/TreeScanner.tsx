import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { treesApi } from "../api/trees";

interface AnalysisResult {
  total_tree_count?: number;
  tree_count?: number;
  canopy_coverage_pct?: number;
  canopy_cover?: number;
  confidence_score?: number;
  health_score?: number;
  tree_health?: {
    healthy: number;
    needs_care: number;
    needs_replacement: number;
  };
  recommendations?: string[];
  overlay_image_url?: string;
}

export default function TreeScanner() {
  const { t } = useTranslation();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const validateAndSetFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file");
      return false;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File size must be less than 20MB");
      return false;
    }
    return true;
  };

  const processFile = (file: File) => {
    if (!validateAndSetFile(file)) return;
    
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
  }, [preview]);

  const analyzeCanopy = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError("");
    try {
      const data = await treesApi.analyze(selectedFile);
      setResult(data);
      console.log("🔍 Analysis result:", data);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "";

      if (errorMessage.includes("quota") || errorMessage.includes("Quota")) {
        setError("🌿 Tree analysis quota exceeded.\n\nPlease try again later or upgrade your WeatherAI plan.");
      } else {
        setError(t("errorAnalyze") || "Failed to analyze image. Please try again.");
      }
      
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
      <h2 className="text-3xl font-semibold mb-2">🌳 Tree Canopy Scanner</h2>
      <p className="text-emerald-400 mb-8">Upload a farm image (drone/aerial preferred)</p>

      <div 
        className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 transition-all duration-200 cursor-pointer
          ${dragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/30 hover:border-emerald-400'}`}
        onClick={() => document.getElementById('tree-upload')?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="tree-upload"
        />
        
        {preview ? (
          <img 
            src={preview} 
            alt="preview" 
            className="max-h-80 mx-auto rounded-xl shadow-xl" 
          />
        ) : (
          <div>
            <div className="text-6xl mb-4">📸</div>
            <p className="text-xl font-medium">Click or drag image here</p>
            <p className="text-emerald-400 text-sm mt-2">JPEG, PNG, WEBP • Max 20MB</p>
          </div>
        )}
      </div>

      <button
        onClick={analyzeCanopy}
        disabled={!selectedFile || loading}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/10 font-semibold rounded-2xl text-lg transition disabled:cursor-not-allowed mb-8 flex items-center justify-center gap-2"
      >
        {loading ? "Analyzing with AI..." : "Analyze Canopy 🌿"}
      </button>

      {error && (
        <div className="bg-amber-500/20 border border-amber-500 text-amber-200 p-5 rounded-2xl mb-6 whitespace-pre-line text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-8">
          {/* Results UI remains the same... */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <p className="text-emerald-400">Trees Detected</p>
              <p className="text-5xl font-bold mt-3">
                {result.total_tree_count ?? result.tree_count ?? "—"}
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <p className="text-emerald-400">Canopy Coverage</p>
              <p className="text-5xl font-bold mt-3">
                {(result.canopy_coverage_pct ?? result.canopy_cover ?? 0)}%
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <p className="text-emerald-400">Confidence Score</p>
              <p className="text-5xl font-bold mt-3">
                {result.confidence_score ?? result.health_score ?? "—"}
              </p>
            </div>
          </div>

          {/* Other result sections (overlay, recommendations, etc.) */}
          {result.overlay_image_url && (
            <div>
              <h3 className="font-semibold mb-4">Detected Trees Overlay</h3>
              <img
                src={result.overlay_image_url}
                alt="annotated result"
                className="rounded-2xl border border-white/20 w-full"
              />
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">AI Recommendations</h3>
              <ul className="space-y-3">
                {result.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="bg-white/5 rounded-2xl p-4">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}