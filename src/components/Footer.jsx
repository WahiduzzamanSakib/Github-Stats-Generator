import { FiGithub, FiLinkedin, FiGlobe, FiHeart } from "react-icons/fi";

const Footer = ({ darkMode }) => {
  const borderClass = darkMode ? "border-slate-800" : "border-slate-200";
  const textClass = darkMode ? "text-slate-400" : "text-slate-600";
  const hoverClass = darkMode ? "hover:text-white" : "hover:text-slate-900";

  return (
    <footer className={`border-t py-8 mt-16 transition-colors duration-300 ${borderClass} ${textClass}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Author / Build Info */}
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <span>Built with</span>
          <FiHeart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span>by</span>
          <a
             href="mailto:wahidzamanpg@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold hover:underline text-indigo-400"
          >
            Md. Wahiduzzaman
          </a>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/WahiduzzamanSakib"
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors duration-200 ${hoverClass}`}
            title="GitHub"
          >
            <FiGithub className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/waheduzzaman-md"
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors duration-200 ${hoverClass}`}
            title="LinkedIn"
          >
            <FiLinkedin className="w-5 h-5" />
          </a>
          <a
            href="https://waheduzzaman.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors duration-200 ${hoverClass}`}
            title="Portfolio"
          >
            <FiGlobe className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
