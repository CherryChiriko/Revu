import { useRef } from "react";
import { STATUS_TILE } from "../SharedStyles";

const LONG_PRESS_MS = 450;

export function CardTile({
  card,
  onClick,
  activeTheme,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onLongPress,
}) {
  const status = card.suspended ? "suspended" : card.status;
  const tile = STATUS_TILE[status] ?? STATUS_TILE.new;

  const pressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const clearPressTimer = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const handlePointerDown = () => {
    longPressTriggered.current = false;
    clearPressTimer();
    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      onLongPress?.(card);
    }, LONG_PRESS_MS);
  };

  const handlePointerUp = () => clearPressTimer();
  const handlePointerLeave = () => clearPressTimer();

  const handleClick = () => {
    if (longPressTriggered.current) {
      // Long-press already handled entering selection mode — swallow the
      // trailing click so it doesn't also toggle selection immediately.
      longPressTriggered.current = false;
      return;
    }
    if (selectionMode) {
      onToggleSelect?.(card);
    } else {
      onClick(card);
    }
  };

  return (
    <button
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerUp}
      className={`relative group flex flex-col justify-between gap-1.5 md:gap-2 min-h-[72px] md:min-h-[84px] rounded-xl border px-2.5 py-2 md:px-3 md:py-2.5 text-left text-[11px] md:text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 ${activeTheme.ring.focus} focus:ring-offset-1 ${activeTheme.background.secondary} ${
        isSelected ? "ring-2 ring-offset-1 " + activeTheme.ring.focus : ""
      } ${activeTheme.border.secondary}`}
    >
      {selectionMode && (
        <span
          className={`absolute top-1.5 right-1.5 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? "bg-blue-600 border-blue-600"
              : `${activeTheme.border.secondary} ${activeTheme.background.app}`
          }`}
        >
          {isSelected && (
            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none">
              <path
                d="M2 6l2.5 2.5L10 3"
                stroke="white"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      )}

      <span className={`line-clamp-3 leading-snug ${activeTheme.text.primary}`}>
        {card.front}
      </span>
      <span
        className={`leading-snug ${activeTheme.text.secondary} line-clamp-1 opacity-60`}
      >
        {card.back}
      </span>
      <span className="flex items-center gap-1">
        <span className={`size-1 md:size-1.5 rounded-full ${tile.dot}`} />
        <span
          className={`text-[8px] md:text-[9px] font-bold uppercase ${tile.text}`}
        >
          {tile.label}
        </span>
      </span>
    </button>
  );
}
