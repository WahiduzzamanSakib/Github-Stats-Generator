import { useState, useEffect } from "react";
import { FiLoader, FiPieChart } from "react-icons/fi";

const LanguageCard = ({
  username,
  theme,
  statsHost,
  darkMode,
}) => {
  const [hostIndex, setHostIndex] = useState(0);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [svgHtml, setSvgHtml] = useState("");

  // ============================================================
  // MAP APP THEME TO GITHUB README STATS THEME
  // ============================================================

  const themeMap = {
    default: "radial",
    dracula: "dracula",
    "tokyo-night": "tokyonight",
    emerald: "vue",
    amber: "radical",
  };

  // ============================================================
  // FALLBACK HOST LIST
  // ============================================================

  const getFallbackChain = (primaryHost) => {
    const chain = [
      primaryHost ||
        "https://github-readme-stats.vercel.app",
    ];

    const defaults = [
      "https://github-readme-stats.vercel.app",
      "https://github-stats-extended.vercel.app",
    ];

    defaults.forEach((host) => {
      if (host !== chain[0]) {
        chain.push(host);
      }
    });

    return chain;
  };

  const hostsChain = getFallbackChain(statsHost);

  const currentHost =
    hostsChain[hostIndex] ||
    "https://github-readme-stats.vercel.app";

  const cardTheme = themeMap[theme] || "radial";

  // ============================================================
  // THEME PARAMETERS
  // ============================================================

  const langThemeParams = darkMode
    ? `bg_color=00000000&theme=${cardTheme}`
    : `bg_color=ffffff&theme=${cardTheme}&title_color=0f172a&text_color=334155`;

  // ============================================================
  // CARD URL
  // ============================================================

  const cardUrl = `${currentHost}/api/top-langs/?username=${username}&layout=compact&${langThemeParams}&hide_border=true`;

  // ============================================================
  // TRACK PREVIOUS PROPS
  // ============================================================

  const [prevProps, setPrevProps] = useState({
    username,
    statsHost,
    theme,
    darkMode,
  });

  // Reset when props change
  if (
    username !== prevProps.username ||
    statsHost !== prevProps.statsHost ||
    theme !== prevProps.theme ||
    darkMode !== prevProps.darkMode
  ) {
    setPrevProps({
      username,
      statsHost,
      theme,
      darkMode,
    });

    setHostIndex(0);
    setError(false);
    setLoading(true);
    setSvgHtml("");
  }

  // ============================================================
  // FETCH SVG AND MODIFY TEXT
  // ============================================================

  useEffect(() => {
    let active = true;

    const fetchSvg = async () => {
      const controller = new AbortController();

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 1500);

      try {
        setLoading(true);
        setError(false);
        setSvgHtml("");

        const response = await fetch(cardUrl, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error("Failed to fetch SVG");
        }

        let text = await response.text();

        // ========================================================
        // VALIDATE SVG
        // ========================================================

        if (!text.trim().startsWith("<svg")) {
          throw new Error(
            "Returned content is not a valid SVG"
          );
        }

        if (active) {
          // ======================================================
          // LIGHT THEME
          //
          // Every SVG text:
          // color = black
          // weight = 600
          //
          // DARK THEME:
          // original color remains
          // weight = 600
          // ======================================================

          text = text.replace(
            /<text\b([^>]*)>/gi,
            (match, attrs) => {
              let newAttrs = attrs;

              // Skip heading text
              if (/data-testid=["']header["']/i.test(newAttrs)) {
                return match;
              }

              // --------------------------------------------------
              // LIGHT THEME
              // Force all text to black
              // --------------------------------------------------

              if (!darkMode) {
                if (
                  /fill\s*=\s*["'][^"']*["']/i.test(
                    newAttrs
                  )
                ) {
                  newAttrs = newAttrs.replace(
                    /fill\s*=\s*["'][^"']*["']/gi,
                    'fill="#000000"'
                  );
                } else {
                  newAttrs += ' fill="#000000"';
                }
              }

              // --------------------------------------------------
              // BOTH THEMES
              // Semibold
              // --------------------------------------------------

              if (
                /font-weight\s*=\s*["'][^"']*["']/i.test(
                  newAttrs
                )
              ) {
                newAttrs = newAttrs.replace(
                  /font-weight\s*=\s*["'][^"']*["']/gi,
                  'font-weight="600"'
                );
              } else {
                newAttrs += ' font-weight="600"';
              }

              return `<text${newAttrs}>`;
            }
          );

          // ======================================================
          // RESPONSIVE SVG
          // ======================================================

          text = text.replace(
            /width=["']\d+["']/i,
            'width="100%"'
          );

          text = text.replace(
            /height=["']\d+["']/i,
            'height="100%"'
          );

          setSvgHtml(text);
          setLoading(false);
        }
      } catch (err) {
        clearTimeout(timeoutId);

        console.warn(
          "SVG fetch failed. Falling back to image rendering:",
          err
        );

        if (active) {
          setSvgHtml("");
        }
      }
    };

    fetchSvg();

    return () => {
      active = false;
    };
  }, [cardUrl, darkMode]);

  // ============================================================
  // IMAGE FALLBACK LOAD
  // ============================================================

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  // ============================================================
  // IMAGE FALLBACK ERROR
  // ============================================================

  const handleError = () => {
    if (hostIndex < hostsChain.length - 1) {
      setHostIndex((prev) => prev + 1);
      setLoading(true);
      setSvgHtml("");
    } else {
      setLoading(false);
      setError(true);
    }
  };

  // ============================================================
  // CARD STYLES
  // ============================================================

  const cardBgClass = darkMode
    ? "galaxy-card text-white"
    : "bg-white border-slate-200 shadow-sm";

  const titleColorClass = darkMode
    ? "text-slate-200"
    : "text-slate-800";

  const innerBgClass = darkMode
    ? "bg-slate-950/20"
    : "bg-slate-50";

  const hostDisplay = currentHost.replace(
    "https://",
    ""
  );

  const isBackup = hostIndex > 0;

  return (
    <div
      className={`w-full border rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl flex flex-col items-center transition-colors duration-300 ${cardBgClass}`}
    >
      {/* ========================================================
          DARK GALAXY BACKGROUND
      ======================================================== */}

      {darkMode && (
        <>
          <div className="galaxy-nebula-1" />
          <div className="galaxy-nebula-2" />

          <div
            className="star w-[1.5px] h-[1.5px]"
            style={{
              top: "20%",
              left: "15%",
              "--duration": "2.8s",
            }}
          />

          <div
            className="star star-blue w-[2px] h-[2px]"
            style={{
              top: "55%",
              left: "5%",
              "--duration": "4.2s",
            }}
          />

          <div
            className="star w-[1px] h-[1px]"
            style={{
              top: "80%",
              left: "30%",
              "--duration": "3s",
            }}
          />

          <div
            className="star star-purple w-[1.5px] h-[1.5px]"
            style={{
              top: "30%",
              left: "55%",
              "--duration": "4.8s",
            }}
          />

          <div
            className="star w-[2px] h-[2px]"
            style={{
              top: "70%",
              left: "70%",
              "--duration": "3.2s",
            }}
          />

          <div
            className="star star-blue w-[1px] h-[1px]"
            style={{
              top: "15%",
              left: "80%",
              "--duration": "4.6s",
            }}
          />

          <div
            className="star w-[1.5px] h-[1.5px]"
            style={{
              top: "45%",
              left: "88%",
              "--duration": "3.4s",
            }}
          />

          <div
            className="star star-purple w-[2px] h-[2px]"
            style={{
              top: "85%",
              left: "50%",
              "--duration": "3.8s",
            }}
          />

          <div
            className="star w-[1px] h-[1px]"
            style={{
              top: "65%",
              left: "82%",
              "--duration": "2.9s",
            }}
          />

          <div
            className="shooting-star-element"
            style={{
              "--delay": "2.5s",
              top: "8%",
              right: "20%",
            }}
          />
        </>
      )}

      {/* ========================================================
          CARD HEADING
      ======================================================== */}

      <div className="flex items-center gap-2 mb-4 self-start z-10">
        <FiPieChart className="w-5 h-5 text-indigo-500" />

        <h4
          className={`font-bold ${titleColorClass}`}
        >
          Top Languages
        </h4>
      </div>

      {/* ========================================================
          LANGUAGE CARD
      ======================================================== */}

      <div
        className={`relative w-full min-h-[195px] flex items-center justify-center rounded-xl overflow-hidden p-2 transition-colors duration-300 z-10 ${innerBgClass}`}
      >
        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px] z-10">
            <FiLoader className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error ? (
          <div className="text-center py-6 px-4">
            <p className="text-rose-500 text-sm font-semibold mb-1">
              Failed to load top languages
            </p>

            <p
              className={`text-xs max-w-[240px] mx-auto leading-relaxed ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Both primary and backup stats servers are
              currently rate-limited or offline. Please
              retry later.
            </p>
          </div>
        ) : svgHtml ? (
          /* ======================================================
             FETCHED + MODIFIED SVG
          ====================================================== */

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
          /* ======================================================
             FALLBACK IMAGE
          ====================================================== */

          <a
            href={cardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex justify-center cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            title="Click to view card URL in a new tab"
          >
            <img
              src={cardUrl}
              alt={`${username}'s Top Languages`}
              className={`w-full max-w-lg transition-opacity duration-300 ${
                loading
                  ? "opacity-0"
                  : "opacity-100"
              }`}
              onLoad={handleLoad}
              onError={handleError}
            />
          </a>
        )}
      </div>

      {/* ========================================================
          BACKUP SERVER NOTICE
      ======================================================== */}

      {isBackup && !error && (
        <span className="text-[10px] text-amber-400/90 mt-2 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15 animate-pulse z-10">
          ⚠️ Loaded from backup: {hostDisplay}
        </span>
      )}
    </div>
  );
};

export default LanguageCard;