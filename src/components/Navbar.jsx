import { FiSun, FiMoon, FiGithub } from "react-icons/fi";

const Navbar = ({ theme, setTheme, darkMode, setDarkMode }) => {
  const themes = [
    { id: "default", name: "Default (Slate)", colorClass: "bg-slate-600" },
    { id: "dracula", name: "Dracula (Purple)", colorClass: "bg-purple-600" },
    { id: "tokyo-night", name: "Tokyo Night (Indigo)", colorClass: "bg-indigo-600" },
    { id: "emerald", name: "Emerald (Green)", colorClass: "bg-emerald-600" },
    { id: "amber", name: "Amber (Orange)", colorClass: "bg-amber-600" },
  ];

  const navBgClass = darkMode
    ? "bg-slate-900/80 border-slate-800 text-white"
    : "bg-white/80 border-slate-200 text-slate-900";

  const titleGradient = darkMode
    ? "from-white via-slate-100 to-slate-400"
    : "from-slate-900 via-slate-800 to-slate-600";

  const selectClass = darkMode
    ? "bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600"
    : "bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400";

  const btnClass = darkMode
    ? "bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700 text-slate-300 hover:text-white"
    : "bg-slate-100 border-slate-300 hover:border-slate-400 hover:bg-slate-200 text-slate-700 hover:text-slate-900";

  return (
    <nav className={`border-b transition-colors duration-300 backdrop-blur-md sticky top-0 z-50 ${navBgClass}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/20">
              <FiGithub className="w-6 h-6 animate-pulse" />
            </div>
            <span className={`font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}>
              GitHub Stats Generator
            </span>
          </div>

          {/* Theme & Mode Selectors */}
          <div className="flex items-center gap-3">
            {/* Theme Dropdown */}
            <div className="relative inline-block text-left">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className={`border text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 cursor-pointer ${selectClass}`}
              >
                {themes.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                    className={darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}
                  >
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 border rounded-xl transition-all duration-200 cursor-pointer ${btnClass}`}
              title="Toggle Light/Dark Mode"
            >
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
