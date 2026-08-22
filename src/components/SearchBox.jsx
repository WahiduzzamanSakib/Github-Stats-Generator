import { useState } from "react";
import { FiSearch, FiLoader, FiAlertCircle, FiX } from "react-icons/fi";

const SearchBox = ({
  onSearch,
  onReset,
  showReset,
  loading,
  error,
  setError,
  initialUsername,
  darkMode = true,
}) => {
  const [usernameInput, setUsernameInput] = useState(initialUsername || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanUsername = usernameInput.trim();
    if (!cleanUsername) {
      setError("Please enter a valid GitHub username.");
      return;
    }
    setError(null);
    onSearch(cleanUsername);
  };

  const handleReset = () => {
    setUsernameInput("");
    setError(null);
    if (onReset) {
      onReset();
    }
  };

  const inputBgClass = darkMode
    ? "bg-slate-800/80 border-slate-700 hover:border-slate-600 focus:border-indigo-500 text-white placeholder-slate-400"
    : "bg-white border-slate-300 hover:border-slate-400 focus:border-indigo-500 text-slate-900 placeholder-slate-400 shadow-sm";

  const resetBtnClass = darkMode
    ? "bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/50"
    : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200";

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className={`absolute left-4 ${darkMode ? "text-slate-400" : "text-slate-400"}`}>
          {loading ? (
            <FiLoader className="w-5 h-5 animate-spin text-indigo-500" />
          ) : (
            <FiSearch className="w-5 h-5" />
          )}
        </div>
        <input
          type="text"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          placeholder="Enter GitHub username (e.g. torvalds)"
          className={`w-full pl-12 py-4 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-lg text-base ${inputBgClass} ${
            showReset ? "pr-44" : "pr-32"
          }`}
          disabled={loading}
        />
        
        <div className="absolute right-2 flex items-center gap-2">
          {showReset && (
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              title="Reset search and clear stats"
              className={`p-2.5 active:scale-95 disabled:opacity-50 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center border ${resetBtnClass}`}
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-700 disabled:to-slate-800 text-white font-medium rounded-xl transition-all duration-300 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Fetching..." : "Generate"}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 flex items-center gap-2.5 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm animate-fadeIn">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default SearchBox;


