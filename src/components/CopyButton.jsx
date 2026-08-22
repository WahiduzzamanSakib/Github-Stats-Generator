import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

const CopyButton = ({ text, label = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 border cursor-pointer
        ${
          copied
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 scale-95"
            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
        }`}
    >
      {copied ? <FiCheck className="w-4 h-4 text-emerald-400 animate-pulse" /> : <FiCopy className="w-4 h-4" />}
      {label && <span>{copied ? "Copied!" : label}</span>}
    </button>
  );
};

export default CopyButton;
