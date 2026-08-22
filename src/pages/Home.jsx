import { useState, useEffect } from "react";
import { fetchGitHubUser } from "../api/github";
import Navbar from "../components/Navbar";
import SearchBox from "../components/SearchBox";
import ProfileCard from "../components/ProfileCard";
import StatsCard from "../components/StatsCard";
import LanguageCard from "../components/LanguageCard";
import StreakCard from "../components/StreakCard";
import CopyButton from "../components/CopyButton";
import Footer from "../components/Footer";
import { FiShare2, FiTerminal, FiSettings } from "react-icons/fi";

const Home = () => {
  const [theme, setTheme] = useState("default");
  const [darkMode, setDarkMode] = useState(true);
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // States for Stats Hosting configurations
  const [statsHostType, setStatsHostType] = useState("default");
  const [customStatsHost, setCustomStatsHost] = useState("");
  const [statsHost, setStatsHost] = useState("https://github-readme-stats.vercel.app");
  const [includeAllCommits, setIncludeAllCommits] = useState(true);
  const [countPrivate, setCountPrivate] = useState(true);

  const handleSearch = async (user) => {
    setLoading(true);
    setError(null);
    setUserData(null);
    setUsername(user);

    try {
      const data = await fetchGitHubUser(user);
      setUserData(data);
      // Update the URL to allow easy sharing
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?username=${user}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    } catch (err) {
      setError(err.message || "Failed to fetch GitHub profile.");
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUsername("");
    setUserData(null);
    setError(null);
    // Clear URL parameters
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  // Check URL query parameters for username on load (to support sharing)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get("username");
    if (userParam) {
      const timer = setTimeout(() => {
        handleSearch(userParam);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleStatsHostTypeChange = (type) => {
    setStatsHostType(type);
    if (type === "default") {
      setStatsHost("https://github-readme-stats.vercel.app");
    } else if (type === "extended") {
      setStatsHost("https://github-stats-extended.vercel.app");
    } else if (type === "custom") {
      let cleaned = customStatsHost.trim();
      if (cleaned.endsWith("/")) {
        cleaned = cleaned.slice(0, -1);
      }
      setStatsHost(cleaned || "https://github-readme-stats.vercel.app");
    }
  };

  const handleCustomStatsHostChange = (val) => {
    setCustomStatsHost(val);
    let cleaned = val.trim();
    if (cleaned.endsWith("/")) {
      cleaned = cleaned.slice(0, -1);
    }
    setStatsHost(cleaned || "https://github-readme-stats.vercel.app");
  };

  // Map theme background gradient and styling classes
  const themePageClasses = {
    default: darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900",
    dracula: darkMode ? "bg-zinc-950 text-white" : "bg-purple-50/40 text-slate-900",
    "tokyo-night": darkMode ? "bg-slate-950 text-white" : "bg-indigo-50/40 text-slate-900",
    emerald: darkMode ? "bg-slate-950 text-white" : "bg-emerald-50/40 text-slate-900",
    amber: darkMode ? "bg-slate-950 text-white" : "bg-amber-50/40 text-slate-900",
  };

  const themeBorderClasses = darkMode ? "border-slate-800" : "border-slate-200";
  const themeSubtextClasses = darkMode ? "text-slate-400" : "text-slate-500";
  const themeCardBg = darkMode ? "bg-slate-900/40" : "bg-white/80";

  // Map theme to sub-badge theme
  const getBadgeColor = () => {
    const mapping = {
      default: "blue",
      dracula: "purple",
      "tokyo-night": "indigo",
      emerald: "green",
      amber: "orange",
    };
    return mapping[theme] || "blue";
  };

  const getStatsTheme = () => {
    const mapping = {
      default: "radial",
      dracula: "dracula",
      "tokyo-night": "tokyonight",
      emerald: "vue",
      amber: "radical",
    };
    return mapping[theme] || "radial";
  };

  const shareUrl = userData
    ? `${window.location.origin}${window.location.pathname}?username=${userData.login}`
    : "";

  const selectedTheme = getStatsTheme();

  // Build markdown parameters dynamically to match UI selection
  const mdStatsParams = darkMode
    ? `theme=${selectedTheme}&bg_color=00000000&title_color=ffffff&text_color=ffffff&icon_color=ffffff`
    : `theme=${selectedTheme}&bg_color=ffffff&title_color=000000&text_color=000000&icon_color=000000`;

  const mdLangParams = darkMode
    ? `theme=${selectedTheme}&bg_color=00000000&title_color=ffffff&text_color=ffffff`
    : `theme=${selectedTheme}&bg_color=ffffff&title_color=000000&text_color=000000`;

  const streakThemeMap = {
    default: "radial",
    dracula: "dracula",
    "tokyo-night": "tokyonight",
    emerald: "nord",
    amber: "radical",
  };
  const selectedStreakTheme = streakThemeMap[theme] || "radial";

  const mdStreakParams = darkMode
    ? `theme=${selectedStreakTheme}&background=00000000&ring=7aa2f7&fire=f97316&currStreakNum=ffffff&currStreakLabel=9ece6a&sideNums=ffffff&sideLabels=9ece6a&dates=a9b1d6&border=00000000`
    : `theme=${selectedStreakTheme}&background=ffffff&ring=6366f1&fire=f97316&currStreakNum=000000&currStreakLabel=475569&sideNums=000000&sideLabels=475569&dates=475569&border=ffffff`;

  const markdownSnippet = userData
    ? `### GitHub Profile Stats

<!-- Profile Views Badge -->
![Profile Views](https://komarev.com/ghpvc/?username=${userData.login}&color=${getBadgeColor()}&style=flat-square)

<!-- Stats Cards -->
[![GitHub Stats](${statsHost}/api?username=${userData.login}&show_icons=true&${mdStatsParams}&hide_border=true${includeAllCommits ? "&include_all_commits=true" : ""}${countPrivate ? "&count_private=true" : ""})](https://github.com/${userData.login})

[![Top Languages](${statsHost}/api/top-langs/?username=${userData.login}&layout=compact&${mdLangParams}&hide_border=true)](https://github.com/${userData.login})

[![GitHub Streak](https://streak-stats.demolab.com/?user=${userData.login}&${mdStreakParams}&hide_border=true)](https://github.com/${userData.login})`
    : "";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themePageClasses[theme]}`}>
      <Navbar theme={theme} setTheme={setTheme} darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Build Your GitHub Profile Cards
          </h2>
          <p className={`text-sm sm:text-base max-w-lg mx-auto ${themeSubtextClasses}`}>
            Enter your GitHub username to generate beautiful profile cards, statistics summary widgets, and Markdown codes for your README.
          </p>
        </div>




        {/* Input/Search Area */}
        <SearchBox
          key={username}
          onSearch={handleSearch}
          onReset={handleReset}
          showReset={!!userData}
          loading={loading}
          error={error}
          setError={setError}
          initialUsername={username}
          darkMode={darkMode}
        />

        {/* Feature Stats */}
        {!userData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div
              className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg 
    transition-all duration-300 hover:-translate-y-2 hover:shadow-indigo-500/20 
    hover:border-indigo-400 cursor-pointer ${themeCardBg} ${themeBorderClasses}`}
            >
              <h3 className="text-xl font-bold mb-2">⚡ Fast</h3>
              <p className={themeSubtextClasses}>Instant Generation</p>
            </div>

            <div
              className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg 
    transition-all duration-300 hover:-translate-y-2 hover:shadow-purple-500/20 
    hover:border-purple-400 cursor-pointer ${themeCardBg} ${themeBorderClasses}`}
            >
              <h3 className="text-xl font-bold mb-2">🎨 Themes</h3>
              <p className={themeSubtextClasses}>Multiple Styles</p>
            </div>

            <div
              className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg 
    transition-all duration-300 hover:-translate-y-2 hover:shadow-blue-500/20 
    hover:border-blue-400 cursor-pointer ${themeCardBg} ${themeBorderClasses}`}
            >
              <h3 className="text-xl font-bold mb-2">📄 README</h3>
              <p className={themeSubtextClasses}>Ready Markdown</p>
            </div>
          </div>
        )}

        {/* Generated Cards Layout */}
        {userData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10 items-start">
            {/* Left Column: Profile Card, Settings & Share Actions */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <ProfileCard userData={userData} theme={theme} />

              {/* Stats API Configuration Card */}
              <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg ${themeCardBg} ${themeBorderClasses}`}>
                <h4 className={`font-bold mb-3 flex items-center gap-2 text-sm ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  <FiSettings className={`w-4 h-4 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} /> Stats API Configuration
                </h4>
                <p className={`text-xs mb-4 leading-relaxed font-semibold ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Select which server to use for rendering statistics and configure card options.
                </p>
                <div className="flex flex-col gap-3">
                  <select
                    value={statsHostType}
                    onChange={(e) => handleStatsHostTypeChange(e.target.value)}
                    className={`w-full border text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer font-semibold ${darkMode
                      ? "bg-slate-950 border-slate-800 text-slate-300"
                      : "bg-white border-slate-300 text-slate-800"
                      }`}
                  >
                    <option value="default" className={darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>
                      Default (github-readme-stats)</option>
                    <option value="extended" className={darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>
                      Alternative (github-stats-extended)</option>
                    <option value="custom" className={darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}>Custom Self-Hosted URL</option>
                  </select>
                  {statsHostType === "custom" && (
                    <input
                      type="text"
                      value={customStatsHost}
                      onChange={(e) => handleCustomStatsHostChange(e.target.value)}
                      placeholder="https://your-custom-instance.vercel.app"
                      className={`w-full border text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-semibold ${darkMode
                        ? "bg-slate-950 border-slate-800 text-slate-300"
                        : "bg-white border-slate-300 text-slate-800"
                        }`}
                    />
                  )}

                  {/* Commits configuration checkboxes */}
                  <div className={`mt-2 flex flex-col gap-2 pt-2 border-t ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                    <label className={`flex items-center gap-2 text-xs cursor-pointer font-semibold ${darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-800"
                      }`}>
                      <input
                        type="checkbox"
                        checked={includeAllCommits}
                        onChange={(e) => setIncludeAllCommits(e.target.checked)}
                        className={`rounded w-4 h-4 cursor-pointer focus:ring-indigo-500/50 ${darkMode ? "border-slate-800 bg-slate-950 text-indigo-500" : "border-slate-300 bg-white text-indigo-600"
                          }`}
                      />
                      <span>Include All-Time Commits</span>
                    </label>
                    <label className={`flex items-center gap-2 text-xs cursor-pointer font-semibold ${darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-800"
                      }`}>
                      <input
                        type="checkbox"
                        checked={countPrivate}
                        onChange={(e) => setCountPrivate(e.target.checked)}
                        className={`rounded w-4 h-4 cursor-pointer focus:ring-indigo-500/50 ${darkMode ? "border-slate-800 bg-slate-950 text-indigo-500" : "border-slate-300 bg-white text-indigo-600"
                          }`}
                      />
                      <span>Count Private Contributions</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Share Card */}
              <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-lg ${themeCardBg} ${themeBorderClasses}`}>
                <h4 className={`font-bold mb-3 flex items-center gap-2 text-sm ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  <FiShare2 className={`w-4 h-4 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} /> Share Profile Page
                </h4>
                <p className={`text-xs mb-4 font-semibold ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Share this generated profile view dashboard directly with others using this link.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className={`flex-1 border text-xs px-3 py-2 rounded-xl focus:outline-none font-semibold ${darkMode ? "bg-slate-950/60 border-slate-800 text-slate-300" : "bg-white border-slate-300 text-slate-800"
                      }`}
                  />
                  <CopyButton text={shareUrl} label="Copy" />
                </div>
              </div>
            </div>

            {/* Right Column: Stats Cards & Markdown Snips */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard
                  key={`${userData.login}-${statsHost}-${theme}-${darkMode}-${includeAllCommits}-${countPrivate}-${userData.public_repos}`}
                  username={userData.login}
                  theme={theme}
                  statsHost={statsHost}
                  darkMode={darkMode}
                  includeAllCommits={includeAllCommits}
                  countPrivate={countPrivate}
                  publicRepos={userData.public_repos}
                />
                <LanguageCard
                  key={`${userData.login}-${statsHost}-${theme}-${darkMode}`}
                  username={userData.login}
                  theme={theme}
                  statsHost={statsHost}
                  darkMode={darkMode}
                />
              </div>
              <div>
                <StreakCard
                  key={`${userData.login}-${theme}-${darkMode}`}
                  username={userData.login}
                  theme={theme}
                  darkMode={darkMode}
                />
              </div>

              {/* Markdown Code Section */}
              <div className={`p-5 sm:p-6 rounded-2xl border backdrop-blur-md shadow-lg ${themeCardBg} ${themeBorderClasses}`}>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h4 className={`font-bold flex items-center gap-2 text-sm ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <FiTerminal className={`w-4.5 h-4.5 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`} /> README Markdown Snippet
                  </h4>
                  <CopyButton text={markdownSnippet} label="Copy All Markdown" />
                </div>
                <p className={`text-xs mb-4 font-semibold ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Copy and paste this snippet directly into your GitHub profile README file.
                </p>
                <pre className={`p-4 border rounded-xl overflow-x-auto text-xs font-mono leading-relaxed max-h-72 font-semibold ${darkMode ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}>
                  {markdownSnippet}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default Home;