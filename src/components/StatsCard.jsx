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

  // ============================================================
  // THEME MAP
  // ============================================================

  const themeMap = {
    default: "radial",
    dracula: "dracula",
    "tokyo-night": "tokyonight",
    emerald: "vue",
    amber: "radical",
  };

  const cardTheme = themeMap[theme] || "radial";

  // ============================================================
  // FALLBACK HOSTS
  // ============================================================

  const hostsChain = useMemo(() => {
    const primary =
      statsHost ||
      "https://github-readme-stats.vercel.app";

    const defaults = [
      "https://github-readme-stats.vercel.app",
      "https://github-stats-extended.vercel.app",
    ];

    return [
      primary,
      ...defaults.filter((host) => host !== primary),
    ];
  }, [statsHost]);

  const currentHost =
    hostsChain[hostIndex] ||
    "https://github-readme-stats.vercel.app";

  // ============================================================
  // THEME PARAMETERS
  // ============================================================

  const statsThemeParams = darkMode
    ? `bg_color=00000000&theme=${cardTheme}`
    : `bg_color=ffffff&theme=${cardTheme}&title_color=0f172a&text_color=334155&icon_color=4f46e5`;

  // ============================================================
  // CARD URL
  // ============================================================

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

  // ============================================================
  // RESET WHEN PROPS CHANGE
  // ============================================================

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
    let text = svgText;

    const repoCount = String(
      Number.isFinite(Number(publicRepos))
        ? Number(publicRepos)
        : 0
    );

    // ==========================================================
    // KEEP "Contributed to" LABEL
    // ==========================================================

    // Normalize possible versions of the label.
    text = text.replace(
      /Contributed\s+to\s*\(last\s+year\)/gi,
      "Contributed to"
    );

    text = text.replace(
      /Contributed\s+To\s*\(last\s+year\)/gi,
      "Contributed to"
    );

    // ==========================================================
    // METHOD 1
    // data-testid="contribs"
    // ==========================================================

    let countChanged = false;

    const contribRegex =
      /(<text\b[^>]*data-testid=["']contribs["'][^>]*>)([\s\S]*?)(<\/text>)/i;

    if (contribRegex.test(text)) {
      text = text.replace(
        contribRegex,
        `$1${repoCount}$3`
      );

      countChanged = true;
    }

    // ==========================================================
    // METHOD 2
    // Look for the "Contributed to" label and nearby number
    // ==========================================================

    if (!countChanged) {
      const labelRegex =
        /Contributed\s+to(?:\s*\(last\s+year\))?/i;

      const labelMatch = text.match(labelRegex);

      if (labelMatch && labelMatch.index !== undefined) {
        const labelIndex = labelMatch.index;

        const sectionStart = Math.max(
          0,
          labelIndex - 1500
        );

        const sectionEnd = Math.min(
          text.length,
          labelIndex + 4000
        );

        const section = text.slice(
          sectionStart,
          sectionEnd
        );

        // Find SVG text nodes containing numbers.
        const numberRegex =
          /(<text\b[^>]*>)[\s]*([\d,]+)[\s]*(<\/text>)/gi;

        const numbers = [
          ...section.matchAll(numberRegex),
        ];

        if (numbers.length > 0) {
          // Prefer a number appearing after the label.
          const relativeLabelIndex =
            labelIndex - sectionStart;

          const afterLabel = numbers.find(
            (match) =>
              match.index > relativeLabelIndex
          );

          const selected =
            afterLabel || numbers[numbers.length - 1];

          if (selected) {
            const original = selected[0];

            const replacement =
              `${selected[1]}${repoCount}${selected[3]}`;

            const absoluteIndex =
              sectionStart + selected.index;

            text =
              text.slice(0, absoluteIndex) +
              replacement +
              text.slice(
                absoluteIndex + original.length
              );

            countChanged = true;
          }
        }
      }
    }

    // ==========================================================
    // METHOD 3
    // XML DOM fallback
    // ==========================================================

    if (!countChanged) {
      try {
        const parser = new DOMParser();

        const doc = parser.parseFromString(
          text,
          "image/svg+xml"
        );

        const allText =
          Array.from(doc.querySelectorAll("text"));

        const labelElement = allText.find((el) =>
          /Contributed\s+to/i.test(
            el.textContent || ""
          )
        );

        if (labelElement) {
          const labelBox =
            labelElement.getBoundingClientRect?.();

          // Search nearby SVG text elements.
          const labelY =
            parseFloat(labelElement.getAttribute("y")) ||
            0;

          let nearest = null;
          let nearestDistance = Infinity;

          allText.forEach((el) => {
            if (el === labelElement) return;

            const value =
              (el.textContent || "").trim();

            if (!/^\d[\d,]*$/.test(value)) return;

            const y =
              parseFloat(el.getAttribute("y")) || 0;

            const distance =
              Math.abs(y - labelY);

            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearest = el;
            }
          });

          if (nearest) {
            nearest.textContent = repoCount;
            text =
              new XMLSerializer().serializeToString(
                doc
              );

            countChanged = true;
          }
        }
      } catch (domError) {
        console.warn(
          "DOM SVG parsing failed:",
          domError
        );
      }
    }

    // ==========================================================
    // SVG TEXT STYLING
    //
    // LIGHT:
    // black + semibold
    //
    // DARK:
    // original color + semibold
    // ==========================================================

    text = text.replace(
      /<text\b([^>]*)>/gi,
      (match, attrs) => {
        let newAttrs = attrs;

        // ------------------------------------------------------
        // LIGHT THEME -> BLACK
        // ------------------------------------------------------

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

        // ------------------------------------------------------
        // BOTH THEMES -> SEMIBOLD
        // ------------------------------------------------------

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

    // ==========================================================
    // RESPONSIVE SVG
    // ==========================================================

    text = text.replace(
      /<svg\b([^>]*)>/i,
      (match, attrs) => {
        let newAttrs = attrs;

        // width
        if (/width\s*=\s*["'][^"']*["']/i.test(newAttrs)) {
          newAttrs = newAttrs.replace(
            /width\s*=\s*["'][^"']*["']/i,
            'width="100%"'
          );
        }

        // height
        if (/height\s*=\s*["'][^"']*["']/i.test(newAttrs)) {
          newAttrs = newAttrs.replace(
            /height\s*=\s*["'][^"']*["']/i,
            'height="100%"'
          );
        }

        return `<svg${newAttrs}>`;
      }
    );

    return text;
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
          throw new Error(
            `Stats server returned ${response.status}`
          );
        }

        const contentType =
          response.headers.get("content-type") || "";

        const rawSvg = await response.text();

        if (cancelled) return;

        // ------------------------------------------------------
        // Validate SVG
        // ------------------------------------------------------

        if (
          !rawSvg.trim().startsWith("<svg") &&
          !contentType.includes("svg")
        ) {
          throw new Error(
            "Stats server did not return valid SVG"
          );
        }

        // ------------------------------------------------------
        // Modify SVG
        // ------------------------------------------------------

        const modifiedSvg = modifySvg(rawSvg);

        if (!modifiedSvg.includes("<svg")) {
          throw new Error(
            "Modified SVG is invalid"
          );
        }

        if (!cancelled) {
          clearTimeout(timeoutId);

          setSvgHtml(modifiedSvg);
          setLoading(false);
          setError(false);
        }
      } catch (err) {
        if (cancelled) return;

        console.warn(
          "Stats SVG processing failed:",
          err
        );

        // IMPORTANT:
        // Do NOT show error immediately.
        // Let <img> fallback render the original card.
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
  // IMAGE FALLBACK
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
  // STYLES
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

  const hostDisplay =
    currentHost.replace("https://", "");

  const isBackup = hostIndex > 0;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className={`relative w-full border rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl flex flex-col items-center transition-colors duration-300 ${cardBgClass}`}
    >
      {/* ======================================================
          GALAXY BACKGROUND
      ====================================================== */}

      {darkMode && (
        <>
          <div className="galaxy-nebula-1" />
          <div className="galaxy-nebula-2" />

          <div
            className="star w-[1.5px] h-[1.5px]"
            style={{
              top: "15%",
              left: "12%",
              "--duration": "3s",
            }}
          />

          <div
            className="star star-blue w-[2px] h-[2px]"
            style={{
              top: "45%",
              left: "8%",
              "--duration": "4s",
            }}
          />

          <div
            className="star w-[1px] h-[1px]"
            style={{
              top: "75%",
              left: "25%",
              "--duration": "2.5s",
            }}
          />

          <div
            className="star star-purple w-[1.5px] h-[1.5px]"
            style={{
              top: "25%",
              left: "60%",
              "--duration": "5s",
            }}
          />

          <div
            className="star w-[2px] h-[2px]"
            style={{
              top: "85%",
              left: "65%",
              "--duration": "3.5s",
            }}
          />

          <div
            className="star star-blue w-[1px] h-[1px]"
            style={{
              top: "10%",
              left: "85%",
              "--duration": "4.5s",
            }}
          />

          <div
            className="star w-[1.5px] h-[1.5px]"
            style={{
              top: "50%",
              left: "92%",
              "--duration": "3s",
            }}
          />

          <div
            className="star star-purple w-[2px] h-[2px]"
            style={{
              top: "80%",
              left: "45%",
              "--duration": "4.2s",
            }}
          />

          <div
            className="star w-[1px] h-[1px]"
            style={{
              top: "60%",
              left: "78%",
              "--duration": "2.8s",
            }}
          />

          <div
            className="star star-blue w-[1.5px] h-[1.5px]"
            style={{
              top: "35%",
              left: "40%",
              "--duration": "3.7s",
            }}
          />

          <div
            className="shooting-star-element"
            style={{
              "--delay": "0s",
              top: "5%",
              right: "15%",
            }}
          />

          <div
            className="shooting-star-element"
            style={{
              "--delay": "5s",
              top: "12%",
              right: "30%",
            }}
          />
        </>
      )}

      {/* ======================================================
          HEADING
      ====================================================== */}

      <div className="flex items-center gap-2 mb-4 self-start z-10">
        <FiBarChart2 className="w-5 h-5 text-indigo-500" />

        <h4
          className={`font-bold text-xl ${titleColorClass}`}
        >
          GitHub Stats
        </h4>
      </div>

      {/* ======================================================
          CARD CONTENT
      ====================================================== */}

      <div
        className={`relative w-full min-h-[195px] flex items-center justify-center rounded-xl overflow-hidden p-2 transition-colors duration-300 z-10 ${innerBgClass}`}
      >
        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px] z-20">
            <FiLoader className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error ? (
          <div className="text-center py-6 px-4">
            <p className="text-rose-500 text-sm font-semibold mb-1">
              Failed to load statistics card
            </p>

            <p
              className={`text-xs max-w-[260px] mx-auto leading-relaxed ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Stats servers are currently unavailable.
              Please retry later.
            </p>
          </div>
        ) : svgHtml ? (
          /* ==================================================
             MODIFIED SVG
          ================================================== */

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
          /* ==================================================
             ORIGINAL IMAGE FALLBACK
          ================================================== */

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

      {/* ======================================================
          BACKUP NOTICE
      ====================================================== */}

      {isBackup && !error && (
        <span className="text-[10px] text-amber-400/90 mt-2 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15 animate-pulse z-10">
          ⚠️ Loaded from backup: {hostDisplay}
        </span>
      )}
    </div>
  );
};

export default StatsCard;