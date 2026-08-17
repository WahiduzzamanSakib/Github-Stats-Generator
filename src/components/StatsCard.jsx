import { useState, useEffect } from "react";
import { FiLoader, FiBarChart2 } from "react-icons/fi";

const StatsCard = ({ username, theme, statsHost, darkMode, includeAllCommits, countPrivate, publicRepos }) => {
  const [hostIndex, setHostIndex] = useState(0);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [svgHtml, setSvgHtml] = useState("");

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
  // In dark mode we use bg_color=00000000 to make the background transparent
  // and theme=tokyonight to match the requested light blue titles, green labels, and white values.
  const statsThemeParams = darkMode
    ? "bg_color=00000000&theme=tokyonight"
    : "bg_color=ffffff&title_color=0f172a&text_color=334155&icon_color=4f46e5";

  // Construct the URL
  const cardUrl = `${currentHost}/api?username=${username}&show_icons=true&${statsThemeParams}${includeAllCommits ? "&include_all_commits=true" : ""}${countPrivate ? "&count_private=true" : ""}&hide_border=true`;

  // Fetch SVG text on parameters change
  useEffect(() => {
    let active = true;
    const fetchSvg = async () => {
      try {
        setLoading(true);
        setError(false);
        setSvgHtml("");

        const response = await fetch(cardUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch SVG");
        }
        let text = await response.text();

        // Validate that it is actually an SVG (Vercel returns HTML when paused/offline)
        if (!text.trim().startsWith("<svg")) {
          throw new Error("Returned content is not a valid SVG");
        }

        if (active) {
          // Replace labels for custom display
          text = text.replace(/Contributed to \(last year\)/g, "Total Repositories");
          text = text.replace(/Contributed to/g, "Total Repositories");
          text = text.replace(/Contributed To/g, "Total Repositories");
          text = text.replace(/Total Stars Earned/g, "Total Stars");
          text = text.replace(/Total Commits \(last year\)/g, "Total Commits");
          
          // Substitute the value with actual public repository count if provided
          if (publicRepos !== undefined && publicRepos !== null) {
            text = text.replace(
              /(<text[^>]*data-testid="contribs"[^>]*>)([^<]+)(<\/text>)/g,
              `$1${publicRepos}$3`
            );
          }

          // Make SVG fit nicely and be responsive
          text = text.replace(/width="\d+"/, 'width="100%"');
          text = text.replace(/height="\d+"/, 'height="100%"');

          setSvgHtml(text);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading stats SVG:", err);
        if (active) {
          // Trigger fallback to next host if available
          if (hostIndex < hostsChain.length - 1) {
            setHostIndex((prev) => prev + 1);
          } else {
            setLoading(false);
            setError(true);
            setSvgHtml("");
          }
        }
      }
    };

    fetchSvg();
    return () => {
      active = false;
    };
  }, [cardUrl, publicRepos, hostIndex]);

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

  const cardBgClass = darkMode ? "galaxy-card text-white" : "bg-white border-slate-200 shadow-sm";
  const titleColorClass = darkMode ? "text-slate-200" : "text-slate-800";
  const innerBgClass = darkMode ? "bg-slate-950/20" : "bg-slate-50";
  const hostDisplay = currentHost.replace("https://", "");
  const isBackup = hostIndex > 0;

  return (
    <div className={`w-full border rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl flex flex-col items-center transition-colors duration-300 ${cardBgClass}`}>
      {/* Background Nebulas and Stars (Only in dark/galaxy mode) */}
      {darkMode && (
        <>
          <div className="galaxy-nebula-1" />
          <div className="galaxy-nebula-2" />
          <div className="star w-[1.5px] h-[1.5px]" style={{ top: "15%", left: "12%", "--duration": "3s" }} />
          <div className="star star-blue w-[2px] h-[2px]" style={{ top: "45%", left: "8%", "--duration": "4s" }} />
          <div className="star w-[1px] h-[1px]" style={{ top: "75%", left: "25%", "--duration": "2.5s" }} />
          <div className="star star-purple w-[1.5px] h-[1.5px]" style={{ top: "25%", left: "60%", "--duration": "5s" }} />
          <div className="star w-[2px] h-[2px]" style={{ top: "85%", left: "65%", "--duration": "3.5s" }} />
          <div className="star star-blue w-[1px] h-[1px]" style={{ top: "10%", left: "85%", "--duration": "4.5s" }} />
          <div className="star w-[1.5px] h-[1.5px]" style={{ top: "50%", left: "92%", "--duration": "3s" }} />
          <div className="star star-purple w-[2px] h-[2px]" style={{ top: "80%", left: "45%", "--duration": "4.2s" }} />
          <div className="star w-[1px] h-[1px]" style={{ top: "60%", left: "78%", "--duration": "2.8s" }} />
          <div className="star star-blue w-[1.5px] h-[1.5px]" style={{ top: "35%", left: "40%", "--duration": "3.7s" }} />
          <div className="shooting-star-element" style={{ "--delay": "0s", top: "5%", right: "15%" }} />
          <div className="shooting-star-element" style={{ "--delay": "5s", top: "12%", right: "30%" }} />
        </>
      )}

      <div className="flex items-center gap-2 mb-4 self-start z-10">
        <FiBarChart2 className="w-5 h-5 text-indigo-500" />
        <h4 className={`font-bold ${titleColorClass}`}>GitHub Stats</h4>
      </div>

      <div className={`relative w-full min-h-[195px] flex items-center justify-center rounded-xl overflow-hidden p-2 transition-colors duration-300 z-10 ${innerBgClass}`}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px] z-10">
            <FiLoader className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        {error ? (
          <div className="text-center py-6 px-4">
            <p className="text-rose-500 text-sm font-semibold mb-1">Failed to load statistics card</p>
            <p className={`text-xs max-w-[240px] mx-auto leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Both primary and backup stats servers are currently rate-limited or offline. Please retry later.
            </p>
          </div>
        ) : svgHtml ? (
          <div
            className="w-full max-w-lg transition-opacity duration-300"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        ) : (
          <img
            src={cardUrl}
            alt={`${username}'s GitHub Stats`}
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

export default StatsCard;

