import { useState, useEffect } from "react";
import { FiLoader, FiZap } from "react-icons/fi";

const StreakCard = ({ username, theme, darkMode }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Map app theme to GitHub Streak Stats theme
  const themeMap = {
    default: "radial",
    dracula: "dracula",
    "tokyo-night": "tokyonight",
    emerald: "nord",
    amber: "radical",
  };

  const cardTheme = themeMap[theme] || "radial";

  // Customize background and text colors to match our dark/light theme
  // In dark mode we use theme=tokyonight, transparent background (00000000), 
  // green labels, white text/numbers, and light blue rings to match the requested look.
  const cardUrl = darkMode
    ? `https://streak-stats.demolab.com/?user=${username}&theme=tokyonight&background=00000000&ring=7aa2f7&fire=f97316&currStreakNum=ffffff&currStreakLabel=9ece6a&sideNums=ffffff&sideLabels=9ece6a&dates=a9b1d6&border=00000000&hide_border=true`
    : `https://streak-stats.demolab.com/?user=${username}&theme=${cardTheme}&background=ffffff&ring=6366f1&fire=f97316&currStreakNum=000000&currStreakLabel=475569&sideNums=000000&sideLabels=475569&dates=475569&border=ffffff&hide_border=true`;

  // Reset states when user data or settings change
  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [username, theme, darkMode]);

  const cardBgClass = darkMode ? "galaxy-card text-white" : "bg-white border-slate-200 shadow-sm";
  const titleColorClass = darkMode ? "text-slate-200" : "text-slate-800";
  const innerBgClass = darkMode ? "bg-slate-950/20" : "bg-slate-50";

  return (
    <div className={`w-full border rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl flex flex-col items-center transition-colors duration-300 ${cardBgClass}`}>
      {/* Background Nebulas and Stars (Only in dark/galaxy mode) */}
      {darkMode && (
        <>
          <div className="galaxy-nebula-1" />
          <div className="galaxy-nebula-2" />
          <div className="star w-[1.5px] h-[1.5px]" style={{ top: "10%", left: "8%", "--duration": "3.5s" }} />
          <div className="star star-blue w-[2px] h-[2px]" style={{ top: "60%", left: "18%", "--duration": "4.1s" }} />
          <div className="star w-[1px] h-[1px]" style={{ top: "75%", left: "45%", "--duration": "2.9s" }} />
          <div className="star star-purple w-[1.5px] h-[1.5px]" style={{ top: "25%", left: "75%", "--duration": "5.2s" }} />
          <div className="star w-[2px] h-[2px]" style={{ top: "85%", left: "85%", "--duration": "3.4s" }} />
          <div className="star star-blue w-[1px] h-[1px]" style={{ top: "20%", left: "35%", "--duration": "4.7s" }} />
          <div className="star w-[1.5px] h-[1.5px]" style={{ top: "50%", left: "62%", "--duration": "3.1s" }} />
          <div className="star star-purple w-[2px] h-[2px]" style={{ top: "40%", left: "92%", "--duration": "4.5s" }} />
          <div className="star w-[1px] h-[1px]" style={{ top: "68%", left: "55%", "--duration": "2.7s" }} />
          <div className="shooting-star-element" style={{ "--delay": "1s", top: "5%", right: "45%" }} />
        </>
      )}

      <div className="flex items-center gap-2 mb-4 self-start z-10">
        <FiZap className="w-5 h-5 text-indigo-500" />
        <h4 className={`font-bold ${titleColorClass}`}>GitHub Streak</h4>
      </div>

      <div className={`relative w-full min-h-[195px] flex items-center justify-center rounded-xl overflow-hidden p-2 transition-colors duration-300 z-10 ${innerBgClass}`}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px] z-10">
            <FiLoader className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        {error ? (
          <div className="text-center py-6 px-4">
            <p className="text-rose-500 text-sm font-semibold mb-1">Failed to load streak statistics</p>
            <p className={`text-xs max-w-[240px] mx-auto leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              The streak statistics server is currently offline or unreachable. Please retry later.
            </p>
          </div>
        ) : (
          <img
            src={cardUrl}
            alt={`${username}'s GitHub Streak`}
            className={`w-full max-w-lg transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
            onLoad={() => {
              setLoading(false);
              setError(false);
            }}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StreakCard;


