import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const StatTile = ({ icon, label, value, note, activeTheme }) => (
  <div
    className={`${activeTheme.background.secondary} border ${activeTheme.border.card} rounded-2xl p-5 shadow-lg relative z-10`}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className={`${activeTheme.text.secondary} text-sm`}>{label}</p>
        <p className="text-3xl font-black mt-1">{value}</p>
      </div>
      <div
        className={`w-11 h-11 rounded-xl ${activeTheme.text.secondary} flex items-center justify-center`}
      >
        <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      </div>
    </div>
    {note && (
      <p className={`${activeTheme.text.secondary} text-sm mt-4`}>{note}</p>
    )}
  </div>
);
