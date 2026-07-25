// src/components/General/ui/LoadingSpinner.jsx
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../../slices/themeSlice";

export default function LoadingSpinner({
  label = "Loading...",
  fullScreen = false,
}) {
  const activeTheme = useSelector(selectActiveTheme);

  const wrapperCls = fullScreen
    ? `fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 ${activeTheme.background.page}`
    : `flex flex-col items-center justify-center gap-4 py-12`;

  return (
    <div className={wrapperCls}>
      <div className="relative w-14 h-14">
        {/* outer ring */}
        <div
          className={`absolute inset-0 rounded-full border-4 ${activeTheme.border?.subtle || "border-purple-200/30"}`}
        />
        {/* spinning gradient arc */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-blue-500 animate-spin"
          style={{ animationDuration: "0.8s" }}
        />
        {/* pulsing dot in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse" />
        </div>
      </div>

      {label && (
        <p
          className={`text-sm font-medium ${activeTheme.text.secondary} animate-pulse`}
        >
          {label}
        </p>
      )}
    </div>
  );
}
