import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const ActivitySection = ({ title, icon, children, activeTheme }) => (
  <section
    className={`${activeTheme.background.secondary} border ${activeTheme.border.card} rounded-2xl p-5 shadow-lg`}
  >
    <div className="flex items-center gap-3 mb-5">
      <div
        className={`w-10 h-10 rounded-xl ${activeTheme.text.secondary}  flex items-center justify-center`}
      >
        <FontAwesomeIcon icon={icon} />
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
    {children}
  </section>
);
