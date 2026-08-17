import { useEffect, useMemo, useState } from "react";
import { FiLoader, FiBarChart2 } from "react-icons/fi";

const StatsCard = ({
  username,
  theme,
  statsHost,
  darkMode,
  includeAllCommits = false,
  countPrivate = false,
  publicRepos = 0,
}) => {
  const [hostIndex, setHostIndex] = useState(0);
  const [svgHtml, setSvgHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const themeMap = {
    default: "radial",
    dracula: "dracula",
    "tokyo-night": "tokyonight",
    emerald: "vue",
    amber: "radical",
  };

  const cardTheme = themeMap[theme] || "radial";

  const hostsChain = useMemo(() => {
    const primary = statsHost || "https://github-readme-stats.vercel.app";

    const defaults = [
      "https://github-readme-stats.vercel.app",
      "https://github-stats-extended.vercel.app",
    ];

    return [primary, ...defaults.filter((host) => host !== primary)];
  }, [statsHost]);

  const currentHost =
    hostsChain[hostIndex] || "https://github-readme-stats.vercel.app";

  const cardUrl = useMemo(() => {
    const params = new URLSearchParams();

    params.set("username", username || "");
    params.set("show_icons", "true");
    params.set("bg_color", darkMode ? "00000000" : "ffffff");
    params.set("theme", cardTheme);
    params.set("hide_border", "true");

    if (!darkMode) {
      params.set("title_color", "0f172a");
      params.set("text_color", "334155");
      params.set("icon_color", "4f46e5");
    }

    if (includeAllCommits) {
      params.set("include_all_commits", "true");
    }

    if (countPrivate) {
      params.set("count_private", "true");
    }

    return `${currentHost}/api?${params.toString()}`;
  }, [
    currentHost,
    username,
    cardTheme,
    darkMode,
    includeAllCommits,
    countPrivate,
  ]);

  useEffect(() => {
    setHostIndex(0);
    setSvgHtml("");
    setError(false);
    setLoading(true);
  }, [
    username,
    statsHost,
    theme,
    darkMode,
    includeAllCommits,
    countPrivate,
    publicRepos,
  ]);

  // ============================================================
  // MODIFY SVG
  // ============================================================

  const modifySvg = (svgText) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      const svg = doc.querySelector("svg");

      if (!svg) {
        return svgText;
      }

      // 1. ORIGINAL SVG DIMENSIONS
      let viewBox = svg.getAttribute("viewBox");
      let svgWidth = 495;
      let svgHeight = 195;

      if (viewBox) {
        const parts = viewBox.trim().split(/\s+/).map(Number);
        if (parts.length === 4 && parts.every(Number.isFinite)) {
          svgWidth = parts[2];
          svgHeight = parts[3];
        }
      } else {
        const widthAttr = parseFloat(svg.getAttribute("width"));
        const heightAttr = parseFloat(svg.getAttribute("height"));

        if (Number.isFinite(widthAttr)) svgWidth = widthAttr;
        if (Number.isFinite(heightAttr)) svgHeight = heightAttr;

        svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
      }

      // 2. RESPONSIVE WIDTH
      svg.setAttribute("width", "100%");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

      // 3. FIND TARGET NODE (Contributed to / Fallbacks)
      const allTextNodes = Array.from(svg.querySelectorAll("text"));

      const targetAnchorNode =
        allTextNodes.find((el) =>
          /Contributed\s+to/i.test(el.textContent || "")
        ) ||
        allTextNodes.find((el) =>
          /Total\s+Commits/i.test(el.textContent || "")
        ) ||
        allTextNodes.find((el) =>
          /Total\s+PRs/i.test(el.textContent || "")
        );

      // 4. ADD TOTAL REPOSITORIES
      if (targetAnchorNode) {
        const x = parseFloat(targetAnchorNode.getAttribute("x")) || 25;
        const y = parseFloat(targetAnchorNode.getAttribute("y")) || 120;
        const textAnchor =
          targetAnchorNode.getAttribute("text-anchor") || "start";
        const ns = "http://www.w3.org/2000/svg";

        const repoCount = String(
          Number.isFinite(Number(publicRepos)) ? Number(publicRepos) : 0
        );

        const labelY = y + 36;
        const valueY = labelY + 20;

        const labelColor = darkMode ? "#94a3b8" : "#475569";
        const valueColor = darkMode ? "#ffffff" : "#0f172a";

        // LABEL
        const repoLabel = doc.createElementNS(ns, "text");
        repoLabel.setAttribute("x", String(x));
        repoLabel.setAttribute("y", String(labelY));
        repoLabel.setAttribute("font-size", "12");
        repoLabel.setAttribute("font-weight", "600");
        repoLabel.setAttribute("fill", labelColor);
        repoLabel.setAttribute("text-anchor", textAnchor);
        repoLabel.textContent = "Total Repositories:";

        // NUMBER
        const repoNumber = doc.createElementNS(ns, "text");
        repoNumber.setAttribute("x", String(x));
        repoNumber.setAttribute("y", String(valueY));
        repoNumber.setAttribute("font-size", "14");
        repoNumber.setAttribute("font-weight", "600");
        repoNumber.setAttribute("fill", valueColor);
        repoNumber.setAttribute("text-anchor", textAnchor);
        repoNumber.textContent = repoCount;

        // APPEND
        svg.appendChild(repoLabel);
        svg.appendChild(repoNumber);

        // EXTEND VIEWBOX IF NEEDED
        const requiredHeight = valueY + 25;
        if (requiredHeight > svgHeight) {
          svgHeight = requiredHeight;
          svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
        }
      }

      // 5. SET ALL TEXT TO SEMI-BOLD (600) & HANDLE DARK/LIGHT COLORS
      const allTexts = svg.querySelectorAll("text");
      allTexts.forEach((element) => {
        element.setAttribute("font-weight", "600");

        if (!darkMode) {
          element.setAttribute("fill", "#000000");
        } else {
          const currentFill = element.getAttribute("fill");
          if (
            !currentFill ||
            currentFill === "#000" ||
            currentFill === "#000000"
          ) {
            element.setAttribute("fill", "#ffffff");
          }
        }
      });

      // 6. SERIALIZE SVG
      return new XMLSerializer().serializeToString(doc);
    } catch (err) {
      console.warn("Could not modify GitHub Stats SVG:", err);
      return svgText;
    }
  };

  // ============================================================
  // FETCH SVG
  // ============================================================

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    const loadSvg = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(cardUrl, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Stats server returned ${response.status}`);
        }

        const rawSvg = await response.text();

        if (cancelled) return;

        if (!rawSvg.trim().startsWith("<svg")) {
          throw new Error("Stats server did not return valid SVG");
        }

        const modifiedSvg = modifySvg(rawSvg);

        if (!modifiedSvg.includes("<svg")) {
          throw new Error("Modified SVG is invalid");
        }

        if (!cancelled) {
          clearTimeout(timeoutId);
          setSvgHtml(modifiedSvg);
          setLoading(false);
          setError(false);
        }
      } catch (err) {
        if (cancelled) return;

        console.warn("Stats SVG processing failed:", err);

        setSvgHtml("");
        setLoading(false);
        setError(false);
      }
    };

    loadSvg();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [cardUrl, publicRepos, darkMode]);

  // ============================================================
  // IMAGE FALLBACK HANDLERS
  // ============================================================

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    if (hostIndex < hostsChain.length - 1) {
      setHostIndex((prev) => prev + 1);
      setSvgHtml("");
      setLoading(true);
      setError(false);
    } else {
      setLoading(false);
      setError(true);
    }
  };

  // ============================================================
  // STYLES & DISPLAY VARS
  // ============================================================

  const cardBgClass = darkMode
    ? "galaxy-card text-white"
    : "bg-white border-slate-200 shadow-sm";

  const titleColorClass = darkMode ? "text-slate-200" : "text-slate-800";

  const innerBgClass = darkMode ? "bg-slate-950/20" : "bg-slate-50";

  const hostDisplay = currentHost.replace("https://", "");

  const isBackup = hostIndex > 0;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className={`relative w-full border rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl flex flex-col items-center transition-colors duration-300 ${cardBgClass}`}
    >
      {/* Galaxy Background */}
      {darkMode && (
        <>
          <div className="galaxy-nebula-1" />
          <div className="galaxy-nebula-2" />

          <div
            className="star w-[1.5px] h-[1.5px]"
            style={{ top: "15%", left: "12%", "--duration": "3s" }}
          />
          <div
            className="star star-blue w-[2px] h-[2px]"
            style={{ top: "45%", left: "8%", "--duration": "4s" }}
          />
          <div
            className="star w-[1px] h-[1px]"
            style={{ top: "75%", left: "25%", "--duration": "2.5s" }}
          />
          <div
            className="star star-purple w-[1.5px] h-[1.5px]"
            style={{ top: "25%", left: "60%", "--duration": "5s" }}
          />
          <div
            className="star w-[2px] h-[2px]"
            style={{ top: "85%", left: "65%", "--duration": "3.5s" }}
          />
          <div
            className="star star-blue w-[1px] h-[1px]"
            style={{ top: "10%", left: "85%", "--duration": "4.5s" }}
          />
          <div
            className="star w-[1.5px] h-[1.5px]"
            style={{ top: "50%", left: "92%", "--duration": "3s" }}
          />
          <div
            className="star star-purple w-[2px] h-[2px]"
            style={{ top: "80%", left: "45%", "--duration": "4.2s" }}
          />
          <div
            className="star w-[1px] h-[1px]"
            style={{ top: "60%", left: "78%", "--duration": "2.8s" }}
          />
          <div
            className="star star-blue w-[1.5px] h-[1.5px]"
            style={{ top: "35%", left: "40%", "--duration": "3.7s" }}
          />

          <div
            className="shooting-star-element"
            style={{ "--delay": "0s", top: "5%", right: "15%" }}
          />
          <div
            className="shooting-star-element"
            style={{ "--delay": "5s", top: "12%", right: "30%" }}
          />
        </>
      )}

      {/* Heading */}
      <div className="flex items-center gap-2 mb-4 self-start z-10">
        <FiBarChart2 className="w-5 h-5 text-indigo-500" />
        <h4 className={`font-bold text-xl ${titleColorClass}`}>GitHub Stats</h4>
      </div>

      {/* Stats Area */}
      <div
        className={`relative w-full min-h-[195px] flex items-center justify-center rounded-xl p-2 transition-colors duration-300 z-10 ${innerBgClass}`}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px] z-20">
            <FiLoader className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        {error ? (
          <div className="text-center py-6 px-4">
            <p className="text-rose-500 text-sm font-semibold mb-1">
              Failed to load statistics card
            </p>
            <p
              className={`text-xs max-w-[260px] mx-auto leading-relaxed ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Stats servers are currently unavailable. Please retry later.
            </p>
          </div>
        ) : svgHtml ? (
          <a
            href={cardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex justify-center cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            title="Open GitHub Stats card"
          >
            <div
              className="w-full flex justify-center"
              dangerouslySetInnerHTML={{
                __html: svgHtml,
              }}
            />
          </a>
        ) : (
          <a
            href={cardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex justify-center cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            title="Open GitHub Stats card"
          >
            <img
              src={cardUrl}
              alt={`${username}'s GitHub Stats`}
              className="w-full max-w-lg"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </a>
        )}
      </div>

      {/* Backup Notice */}
      {isBackup && !error && (
        <span className="text-[10px] text-amber-400/90 mt-2 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15 animate-pulse z-10">
          ⚠️ Loaded from backup: {hostDisplay}
        </span>
      )}
    </div>
  );
};

export default StatsCard;