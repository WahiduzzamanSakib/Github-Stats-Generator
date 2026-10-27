import { useState, useEffect, useCallback, useMemo } from "react";
import { FiLoader, FiZap, FiRefreshCw } from "react-icons/fi";

const StreakCard = ({ username, theme, darkMode }) => {
  const [hostIndex, setHostIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [svgHtml, setSvgHtml] = useState("");

  const themeMap = {
    default: "radial",
    dracula: "dracula",
    "tokyo-night": "tokyonight",
    emerald: "nord",
    amber: "radical",
  };

  const cardTheme = themeMap[theme] || "radial";

  const hostsChain = useMemo(() => [
    "https://streak-stats.demolab.com",
    "https://github-readme-streak-stats.herokuapp.com",
    "https://github-readme-streak-stats.vercel.app",
  ], []);

  const currentHost = hostsChain[hostIndex] || hostsChain[0];

  const cardUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("user", username || "");
    params.set("theme", cardTheme);
    params.set("border", "06b6d4");
    params.set("border_radius", "12");
    params.set("hide_border", "false");

    if (darkMode) {
      params.set("background", "00000000");
      params.set("ring", "06b6d4");
      params.set("fire", "f97316");
      params.set("currStreakNum", "ffffff");
      params.set("currStreakLabel", "38bdf8");
      params.set("sideNums", "ffffff");
      params.set("sideLabels", "38bdf8");
      params.set("dates", "a9b1d6");
    } else {
      params.set("background", "ffffff");
      params.set("ring", "06b6d4");
      params.set("fire", "f97316");
      params.set("currStreakNum", "000000");
      params.set("currStreakLabel", "0284c7");
      params.set("sideNums", "000000");
      params.set("sideLabels", "0284c7");
      params.set("dates", "475569");
    }

    return `${currentHost}/?${params.toString()}`;
  }, [currentHost, username, cardTheme, darkMode]);

  const modifySvg = useCallback((svgText) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      const svg = doc.querySelector("svg");

      if (!svg) {
        return svgText;
      }

      svg.setAttribute("width", "100%");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.setAttribute(
        "style",
        "border: 2px solid #06b6d4 !important; border-radius: 12px; box-shadow: 0 0 14px rgba(6, 182, 212, 0.35);"
      );

      const textColor = darkMode ? "#ffffff" : "#000000";

      const allTexts = svg.querySelectorAll("text, tspan");
      allTexts.forEach((element) => {
        element.setAttribute("font-weight", "bold");
        element.setAttribute("fill", textColor);
        if (element.style) {
          element.style.fontWeight = "bold";
          element.style.fill = textColor;
        }
      });

      const styleEl = doc.createElementNS("http://www.w3.org/2000/svg", "style");
      styleEl.textContent = `
        text, tspan {
          font-weight: bold !important;
          fill: ${textColor} !important;
        }
        svg {
          border: 2px solid #06b6d4 !important;
          border-radius: 12px !important;
        }
      `;
      svg.appendChild(styleEl);

      return new XMLSerializer().serializeToString(doc);
    } catch (err) {
      console.warn("Could not modify GitHub Streak SVG:", err);
      return svgText;
    }
  }, [darkMode]);

  const loadSvg = useCallback(async () => {
    if (!username) return;

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      setLoading(true);
      setError(false);

      const response = await fetch(cardUrl, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Streak server returned ${response.status}`);
      }

      const rawSvg = await response.text();

      if (cancelled) return;

      if (!rawSvg.trim().startsWith("<svg")) {
        throw new Error("Streak server did not return valid SVG");
      }

      const modifiedSvg = modifySvg(rawSvg);

      if (!cancelled) {
        setSvgHtml(modifiedSvg);
        setLoading(false);
        setError(false);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (cancelled) return;

      console.warn("Streak SVG fetch failed, trying fallback image:", err);

      if (hostIndex < hostsChain.length - 1) {
        setHostIndex((prev) => prev + 1);
      } else {
        setSvgHtml("");
        setLoading(false);
        setError(true);
      }
    }

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [cardUrl, hostIndex, hostsChain.length, modifySvg, username]);

  useEffect(() => {
    loadSvg();
  }, [loadSvg]);

  const handleRetry = () => {
    setHostIndex(0);
    setSvgHtml("");
    loadSvg();
  };

  const cardBgClass = darkMode
    ? "galaxy-card text-white border-cyan-500"
    : "bg-white border-cyan-500 shadow-sm cyan-card-border";

  const titleColorClass = darkMode ? "text-slate-200" : "text-slate-800";
  const innerBgClass = darkMode ? "bg-transparent" : "bg-cyan-50/20 border border-cyan-500/20";

  return (
    <div
      className={`w-full border rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl flex flex-col items-center transition-colors duration-300 ${cardBgClass}`}
    >
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

      <div
        className={`relative w-full min-h-[195px] flex items-center justify-center rounded-xl overflow-hidden p-2 transition-colors duration-300 z-10 ${innerBgClass}`}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px] z-10">
            <FiLoader className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        {error ? (
          <div className="text-center py-6 px-4 flex flex-col items-center">
            <p className="text-rose-500 text-sm font-semibold mb-1">
              Failed to load streak statistics
            </p>
            <p
              className={`text-xs max-w-[240px] mx-auto leading-relaxed mb-3 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              The streak statistics server is currently busy or rate-limited. Click retry to attempt loading again.
            </p>
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FiRefreshCw className="w-3.5 h-3.5" /> Retry Streak Server
            </button>
          </div>
        ) : svgHtml ? (
          <a
            href={cardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex justify-center cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            title="Click to view card URL in a new tab"
            dangerouslySetInnerHTML={{
              __html: svgHtml,
            }}
          />
        ) : (
          <a
            href={cardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex justify-center cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            title="Click to view card URL in a new tab"
          >
            <img
              src={cardUrl}
              alt={`${username}'s GitHub contribution streak statistics`}
              className={`w-full max-w-lg border-2 border-cyan-500 rounded-xl shadow-lg shadow-cyan-500/20 transition-opacity duration-300 ${
                loading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => {
                setLoading(false);
                setError(false);
              }}
              onError={() => {
                if (hostIndex < hostsChain.length - 1) {
                  setHostIndex((prev) => prev + 1);
                } else {
                  setLoading(false);
                  setError(true);
                }
              }}
            />
          </a>
        )}
      </div>
    </div>
  );
};

export default StreakCard;
