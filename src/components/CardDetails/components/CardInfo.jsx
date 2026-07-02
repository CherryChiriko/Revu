import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faGaugeHigh,
  faRepeat,
} from "@fortawesome/free-solid-svg-icons";

import { STATUS_TILE } from "../../DeckDetails/components/SharedStyles";

const getCardStrengthLabel = (easeFactor, status) => {
  if (status === "new") return "New card";
  const ef = Number(easeFactor);

  if (ef < 1.7) return "Challenging";
  if (ef < 2.2) return "Getting There";
  if (ef <= 2.6) return "Good";
  return "Mastered 🎉";
};

const MetaRow = ({ icon, label, value, activeTheme }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`flex items-center gap-2 text-xs ${activeTheme.text.muted}`}
      >
        <FontAwesomeIcon icon={icon} className="w-3 h-3" />
        {label}
      </span>
      <span
        className={`text-xs font-semibold ${activeTheme.text.secondary} text-right`}
      >
        {value}
      </span>
    </div>
  );
};

export function CardInfo({ card, isC, activeTheme }) {
  const tile = STATUS_TILE[card.status] ?? STATUS_TILE.new;
  console.log(card.status);
  return (
    <>
      <section className="space-y-1.5">
        <label
          className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
        >
          Front
        </label>
        <p
          className={`text-2xl font-extrabold leading-snug ${activeTheme.text.primary}`}
        >
          {card.front}
        </p>
      </section>

      <div className={`h-px ${activeTheme.background.track}`} />

      <section className="space-y-1.5">
        <label
          className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
        >
          Back / Meaning
        </label>
        <p
          className={`text-base leading-relaxed ${activeTheme.text.secondary}`}
        >
          {card.back || (
            <span className={activeTheme.text.muted}>
              No definition provided.
            </span>
          )}
        </p>
      </section>

      {isC && card.reading && (
        <>
          <div className={`h-px ${activeTheme.background.track}`} />
          <section className="space-y-1.5">
            <label
              className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
            >
              Reading
            </label>
            <p className={`text-base ${activeTheme.text.secondary}`}>
              {card.reading}
            </p>
          </section>
        </>
      )}

      <div className={`h-px ${activeTheme.background.track}`} />

      <section className="space-y-3">
        <label
          className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.secondary}`}
        >
          Card info
        </label>
        <div>
          <span className="flex items-center gap-1">
            <span className={`size-1.5 rounded-full ${tile.dot}`} />
            <span className={`text-xs font-bold uppercase ${tile.text}`}>
              {tile.label}
            </span>
          </span>
        </div>

        <div className="space-y-2.5">
          {card.ease_factor != null && (
            <MetaRow
              icon={faGaugeHigh}
              label="Recall score"
              value={getCardStrengthLabel(card.ease_factor, card.status)}
              activeTheme={activeTheme}
            />
          )}
          {card.repetitions != null && (
            <MetaRow
              icon={faRepeat}
              label="Times studied"
              value={card.repetitions}
              activeTheme={activeTheme}
            />
          )}
          {card.due_date && (
            <MetaRow
              icon={faCalendarDays}
              label="Due date for review"
              value={new Date(card.due_date).toLocaleDateString()}
              activeTheme={activeTheme}
            />
          )}
        </div>
      </section>
    </>
  );
}
