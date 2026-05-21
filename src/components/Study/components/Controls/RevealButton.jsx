import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const RevealButton = ({ onReveal, activeTheme }) => (
  <button
    onClick={onReveal}
    className={`px-6 py-3 rounded-full font-semibold ${
      activeTheme?.button?.primary ?? "bg-indigo-600"
    } ${activeTheme?.text?.activeButton ?? "text-white"}
    transition-all duration-300 shadow-lg hover:shadow-xl`}
  >
    <FontAwesomeIcon icon={faEye} className="w-5 h-5 mr-2" />
    Reveal Answer
  </button>
);

export default RevealButton;
