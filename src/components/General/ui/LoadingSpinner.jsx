// src/components/General/ui/LoadingSpinner.jsx
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../../slices/themeSlice";

export default function LoadingSpinner({
  label = "Loading...",
  fullScreen = false,
}) {
  const activeTheme = useSelector(selectActiveTheme);
  const [c1, c2] = activeTheme.gradients.colors.slice(-2); // two most vivid accent colors

  const wrapperCls = fullScreen
    ? `fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 ${activeTheme.background.app}`
    : `flex flex-col items-center justify-center gap-4 py-12`;

  const ringMask = {
    WebkitMask:
      "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
    mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
  };

  return (
    <div className={wrapperCls}>
      <div className="relative w-14 h-14">
        {/* outer ring - faint track */}
        <div
          className={`absolute inset-0 rounded-full border-4 ${activeTheme.background.app}`}
        />

        {/* spinning arc - gradient with a transparent gap */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            ...ringMask,
            animationDuration: "0.8s",
            background: `conic-gradient(from 0deg, ${c1}, ${c2} 65%, transparent 75%, transparent 100%)`,
          }}
        />

        {/* pulsing dot in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
          />
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
