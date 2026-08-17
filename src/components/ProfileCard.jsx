import { useRef } from "react";
import { FiUsers, FiBookOpen, FiEye, FiExternalLink } from "react-icons/fi";

const ProfileCard = ({ userData, theme }) => {
  const cardRef = useRef(null);

  // Theme styling mapping
  const themeStyles = {
    default: {
      cardBg: "bg-slate-900/90 border-slate-800",
      headerBg: "from-blue-600 to-indigo-700",
      accentText: "text-blue-400",
      badgeColor: "blue",
      btnBg: "bg-blue-600 hover:bg-blue-700",
    },
    dracula: {
      cardBg: "bg-zinc-950/90 border-purple-900/30",
      headerBg: "from-purple-600 to-pink-700",
      accentText: "text-purple-400",
      badgeColor: "purple",
      btnBg: "bg-purple-600 hover:bg-purple-700",
    },
    "tokyo-night": {
      cardBg: "bg-slate-950/90 border-indigo-900/30",
      headerBg: "from-indigo-600 to-cyan-700",
      accentText: "text-indigo-400",
      badgeColor: "indigo",
      btnBg: "bg-indigo-600 hover:bg-indigo-700",
    },
    emerald: {
      cardBg: "bg-slate-950/90 border-emerald-900/30",
      headerBg: "from-emerald-600 to-teal-700",
      accentText: "text-emerald-400",
      badgeColor: "green",
      btnBg: "bg-emerald-600 hover:bg-emerald-700",
    },
    amber: {
      cardBg: "bg-slate-950/90 border-amber-900/30",
      headerBg: "from-amber-500 to-orange-600",
      accentText: "text-amber-400",
      badgeColor: "orange",
      btnBg: "bg-amber-500 hover:bg-amber-600",
    },
  };

  const style = themeStyles[theme] || themeStyles.default;

 
  return (
    <div className="w-full flex flex-col items-center">
      {/* Profile Card Container (target for html-to-image) */}
      <div
        ref={cardRef}
        className={`w-full max-w-md rounded-2xl border backdrop-blur-md overflow-hidden shadow-xl transition-all duration-300 ${style.cardBg}`}
      >
        {/* Banner/Header */}
        <div className={`h-24 bg-gradient-to-r ${style.headerBg} relative`} />

        {/* Content */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center">
          {/* Avatar (overlapping banner) */}
          <div className="w-24 h-24 rounded-full border-4 border-slate-900 overflow-hidden -mt-12 shadow-lg bg-slate-800">
            <img
              src={userData.avatar_url}
              alt={userData.name || userData.login}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name & Login */}
          <h3 className="mt-3 text-2xl font-bold text-white tracking-tight leading-none">
            {userData.name || userData.login}
          </h3>
          <a
            href={userData.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-1.5 text-sm font-semibold flex items-center gap-1 hover:underline cursor-pointer ${style.accentText}`}
          >
            @{userData.login}
            <FiExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Bio */}
          {userData.bio && (
            <p className="mt-4 text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-xs">
              {userData.bio}
            </p>
          )}

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex flex-col items-center p-3 bg-slate-800/40 rounded-xl border border-slate-800/50">
              <FiUsers className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-lg font-bold text-white">{userData.followers}</span>
              <span className="text-xs text-slate-400">Followers</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-slate-800/40 rounded-xl border border-slate-800/50">
              <FiBookOpen className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-lg font-bold text-white">{userData.public_repos}</span>
              <span className="text-xs text-slate-400">Repositories</span>
            </div>
          </div>

          {/* Profile Views */}
          <div className="flex flex-col items-center w-full mt-4 p-3 bg-slate-800/40 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
              <FiEye className="w-4 h-4" />
              <span>Profile Views</span>
            </div>
            <img
              src={`https://komarev.com/ghpvc/?username=${userData.login}&color=${style.badgeColor}&style=flat-square`}
              alt="Profile Views"
              className="h-5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
