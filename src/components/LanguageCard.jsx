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
  // In dark mode we use bg_color=00000000 (transparent) and theme=tokyonight
  const langThemeParams = darkMode
    ? "bg_color=00000000&theme=tokyonight"
    : "bg_color=ffffff&title_color=0f172a&text_color=334155";

  // Construct the URL
  const cardUrl = `${currentHost}/api/top-langs/?username=${username}&layout=compact&${langThemeParams}&hide_border=true`;

  // Reset the fallback state whenever user data or settings change
  useEffect(() => {
    setHostIndex(0);
    setError(false);
    setLoading(true);
  }, [username, statsHost, theme, darkMode]);

  const cardBgClass = darkMode ? "galaxy-card text-white" : "bg-white border-slate-200 shadow-sm";
  const titleColorClass = darkMode ? "text-slate-200" : "text-slate-800";
  const innerBgClass = darkMode ? "bg-slate-950/20" : "bg-slate-50";
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
      {/* Background Nebulas and Stars (Only in dark/galaxy mode) */}
      {darkMode && (
        <>
          <div className="galaxy-nebula-1" />
          <div className="galaxy-nebula-2" />
          <div className="star w-[1.5px] h-[1.5px]" style={{ top: "20%", left: "15%", "--duration": "2.8s" }} />
          <div className="star star-blue w-[2px] h-[2px]" style={{ top: "55%", left: "5%", "--duration": "4.2s" }} />
          <div className="star w-[1px] h-[1px]" style={{ top: "80%", left: "30%", "--duration": "3s" }} />
          <div className="star star-purple w-[1.5px] h-[1.5px]" style={{ top: "30%", left: "55%", "--duration": "4.8s" }} />
          <div className="star w-[2px] h-[2px]" style={{ top: "70%", left: "70%", "--duration": "3.2s" }} />
          <div className="star star-blue w-[1px] h-[1px]" style={{ top: "15%", left: "80%", "--duration": "4.6s" }} />
          <div className="star w-[1.5px] h-[1.5px]" style={{ top: "45%", left: "88%", "--duration": "3.4s" }} />
          <div className="star star-purple w-[2px] h-[2px]" style={{ top: "85%", left: "50%", "--duration": "3.8s" }} />
          <div className="star w-[1px] h-[1px]" style={{ top: "65%", left: "82%", "--duration": "2.9s" }} />
          <div className="shooting-star-element" style={{ "--delay": "2.5s", top: "8%", right: "20%" }} />
        </>
      )}

      <div className="flex items-center gap-2 mb-4 self-start z-10">
        <FiPieChart className="w-5 h-5 text-indigo-500" />
        <h4 className={`font-bold ${titleColorClass}`}>Top Languages</h4>
      </div>

      <div className={`relative w-full min-h-[195px] flex items-center justify-center rounded-xl overflow-hidden p-2 transition-colors duration-300 z-10 ${innerBgClass}`}>
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
        <span className="text-[10px] text-amber-400/90 mt-2 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15 animate-pulse z-10">
          ⚠️ Loaded from backup: {hostDisplay}
        </span>
      )}
    </div>
  );
};

export default LanguageCard;

