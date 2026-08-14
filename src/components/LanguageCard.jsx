import { useState, useEffect } from "react";
import { FiLoader, FiPieChart } from "react-icons/fi";

const LanguageCard = ({ username, theme, statsHost, darkMode }) => {
  const [hostIndex, setHostIndex] = useState(0);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Map app theme to GitHub Readme Stats theme
  const themeMap = {
    default: "radial",
    dracula: "dracula",
    "tokyo-night": "tokyonight",
    emerald: "vue",
    amber: "radical",
  };

  // Generate fallback host list dynamically based on user's primary selected host
  const getFallbackChain = (primaryHost) => {
    const chain = [primaryHost || "https://github-readme-stats.vercel.app"];
    const defaults = [
      "https://github-readme-stats.vercel.app",
      "https://github-stats-extended.vercel.app"
    ];
    defaults.forEach((h) => {
      if (h !== chain[0]) {
        chain.push(h);
      }
    });
    return chain;
  };

  const hostsChain = getFallbackChain(statsHost);
  const currentHost = hostsChain[hostIndex] || "https://github-readme-stats.vercel.app";
  const cardTheme = themeMap[theme] || "radial";
  
  // Choose theme parameters based on light/dark mode
  const langThemeParams = darkMode
    ? "bg_color=0f172a&title_color=f8fafc&text_color=94a3b8"
    : "bg_color=ffffff&title_color=0f172a&text_color=334155";

  // Construct the URL
  const cardUrl = `${currentHost}/api/top-langs/?username=${username}&layout=compact&theme=${cardTheme}&${langThemeParams}&hide_border=true`;

  // Reset the fallback state whenever user data or settings change
  useEffect(() => {
    setHostIndex(0);
    setError(false);
    setLoading(true);
  }, [username, statsHost, theme, darkMode]);

  const cardBgClass = darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm";
  const titleColorClass = darkMode ? "text-slate-200" : "text-slate-800";
  const innerBgClass = darkMode ? "bg-slate-950/40" : "bg-slate-50";
  const hostDisplay = currentHost.replace("https://", "");
  const isBackup = hostIndex > 0;

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    if (hostIndex < hostsChain.length - 1) {
      setHostIndex((prev) => prev + 1);
      setLoading(true);
    } else {
      setLoading(false);
      setError(true);
    }
  };

  return (
    <div className={`w-full border rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl flex flex-col items-center transition-colors duration-300 ${cardBgClass}`}>
      <div className="flex items-center gap-2 mb-4 self-start">
        <FiPieChart className="w-5 h-5 text-indigo-500" />
        <h4 className={`font-bold ${titleColorClass}`}>Top Languages</h4>
      </div>

      <div className={`relative w-full min-h-[195px] flex items-center justify-center rounded-xl overflow-hidden p-2 transition-colors duration-300 ${innerBgClass}`}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px] z-10">
            <FiLoader className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        {error ? (
          <div className="text-center py-6 px-4">
            <p className="text-rose-500 text-sm font-semibold mb-1">Failed to load top languages</p>
            <p className={`text-xs max-w-[240px] mx-auto leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Both primary and backup stats servers are currently rate-limited or offline. Please retry later.
            </p>
          </div>
        ) : (
          <img
            src={cardUrl}
            alt={`${username}'s Top Languages`}
            className={`w-full max-w-lg transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>

      {isBackup && !error && (
        <span className="text-[10px] text-amber-400/90 mt-2 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15 animate-pulse">
          ⚠️ Loaded from backup: {hostDisplay}
        </span>
      )}
    </div>
  );
};

export default LanguageCard;

