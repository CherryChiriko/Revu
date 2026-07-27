import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../../slices/themeSlice";

export default function LoadingSpinner({
  label = "Loading...",
  fullScreen = false,
}) {
  const activeTheme = useSelector(selectActiveTheme);

  // Safely grab background & text colors
  const pageBg = activeTheme?.background?.app || "bg-gray-900";
  const borderMuted = activeTheme?.border?.muted || "border-gray-700";
  const textColor = activeTheme?.text?.secondary || "text-gray-300";
  const dotBg = activeTheme?.background?.accent1 || "bg-sky-500";

  // Dynamic theme gradient colors
  const gradientColors = activeTheme?.gradients?.colors || [];
  const colorStart = gradientColors[2] || "#3d33bf";
  const colorEnd = gradientColors[3] || "#9400ff";

  const wrapperCls = fullScreen
    ? `fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 ${pageBg}`
    : `flex flex-col items-center justify-center gap-4 py-12`;

  // Anti-aliased radial mask gradient
  const smoothMask =
    "radial-gradient(farthest-side, transparent calc(100% - 4.5px), black calc(100% - 5px) calc(100% - 0.5px), transparent 100%)";

  return (
    <div className={wrapperCls}>
      <div className="relative w-14 h-14">
        {/* Outer subtle ring */}
        <div
          className={`absolute inset-0 rounded-full border-4 ${borderMuted}`}
        />

        {/* Smooth Spinning Gradient Arc */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${colorStart} 50%, ${colorEnd} 100%)`,
            mask: smoothMask,
            WebkitMask: smoothMask,
            animationDuration: "0.8s",
          }}
        />

        {/* Pulsing center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full ${dotBg} animate-pulse`} />
        </div>
      </div>

      {label && (
        <p className={`text-sm font-medium ${textColor} animate-pulse`}>
          {label}
        </p>
      )}
    </div>
  );
}
