import { STATUS_TILE } from "../SharedStyles";

export function CardTile({ card, onClick, activeTheme }) {
  const status = card.suspended ? "suspended" : card.status;
  const tile = STATUS_TILE[status] ?? STATUS_TILE.new;

  return (
    <button
      onClick={() => onClick(card)}
      className={`group flex flex-col justify-between gap-2 min-h-[84px] rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 ${activeTheme.ring.focus} focus:ring-offset-1 ${activeTheme.background.secondary} ${activeTheme.border.secondary}`}
    >
      <span
        className={`line-clamp-3 text-xs leading-snug ${activeTheme.text.primary}`}
      >
        {card.front}
      </span>
      <span
        className={`text-xs leading-snug ${activeTheme.text.secondary} line-clamp-1 opacity-60`}
      >
        {card.back}
      </span>
      <span className="flex items-center gap-1">
        <span className={`size-1.5 rounded-full ${tile.dot}`} />
        <span className={`text-[9px] font-bold uppercase ${tile.text}`}>
          {tile.label}
        </span>
      </span>
    </button>
  );
}
