import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGaugeHigh, faSeedling } from "@fortawesome/free-solid-svg-icons";

import { STATUS_TILE } from "../../DeckDetails/components/SharedStyles";
import { getMasterySummary } from "../../../utils/cardMastery";

const getCardStrengthLabel = (easeFactor, status) => {
  if (status === "new") return "New card";
  const ef = Number(easeFactor);
  if (ef < 1.7) return "Challenging";
  if (ef < 2.2) return "Getting there";
  if (ef <= 2.6) return "Good";
  return "Excellent";
};

const MetaRow = ({ icon, label, value, activeTheme }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`flex items-center gap-2 text-[11px] md:text-xs ${activeTheme.text.muted}`}
      >
        <FontAwesomeIcon icon={icon} className="w-3 h-3" />
        {label}
      </span>
      <span
        className={`text-[11px] md:text-xs font-semibold ${activeTheme.text.secondary} text-right`}
      >
        {value}
      </span>
    </div>
  );
};

export function CardInfo({ card, isC, activeTheme }) {
  const tile = STATUS_TILE[card.status] ?? STATUS_TILE.new;
  const mastery = getMasterySummary(card);

  return (
    <>
      <section className="space-y-1 md:space-y-1.5">
        <label
          className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
        >
          Front
        </label>
        <p
          className={`text-xl md:text-2xl font-extrabold leading-snug ${activeTheme.text.primary}`}
        >
          {card.front}
        </p>
      </section>

      <div className={`h-px ${activeTheme.background.track}`} />

      <section className="space-y-1 md:space-y-1.5">
        <label
          className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
        >
          Back / Meaning
        </label>
        <p
          className={`text-sm md:text-base leading-relaxed ${activeTheme.text.secondary}`}
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
          <section className="space-y-1 md:space-y-1.5">
            <label
              className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
            >
              Reading
            </label>
            <p className={`text-sm md:text-base ${activeTheme.text.secondary}`}>
              {card.reading}
            </p>
          </section>
        </>
      )}

      <div className={`h-px ${activeTheme.background.track}`} />

      <section className="space-y-2 md:space-y-3">
        <div className="flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${tile.dot}`} />
          <span className={`text-xs font-bold uppercase ${tile.text}`}>
            {tile.label}
          </span>
        </div>

        <div className="space-y-2 md:space-y-2.5">
          {card.ease_factor != null && (
            <MetaRow
              icon={faGaugeHigh}
              label="Recall score"
              value={getCardStrengthLabel(card.ease_factor, card.status)}
              activeTheme={activeTheme}
            />
          )}
          <MetaRow
            icon={faSeedling}
            label="Completeness"
            value={`${mastery.label} (${mastery.progress}%)`}
            activeTheme={activeTheme}
          />
        </div>
      </section>
    </>
  );
}
