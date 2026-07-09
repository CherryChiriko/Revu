import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const RevealButton = ({ onReveal, activeTheme, variant = "standard" }) => {
  const isDemo = variant === "demo";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevents double-triggering parent click states
        onReveal();
      }}
      className={`rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center ${
        activeTheme?.button?.primary ?? "bg-indigo-600"
      } ${activeTheme?.text?.activeButton ?? "text-white"} ${
        isDemo ? "px-4 py-1.5 text-xs mb-1" : "px-6 py-3"
      }`}
    >
      <FontAwesomeIcon
        icon={faEye}
        className={isDemo ? "w-3 h-3 mr-1.5" : "w-5 h-5 mr-2"}
      />
      Reveal Answer
    </button>
  );
};

export default RevealButton;
