import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faGaugeHigh,
  faRepeat,
} from "@fortawesome/free-solid-svg-icons";

const MetaRow = ({ icon, label, value, activeTheme }) => (
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

export function CardInfo({ card, isC, activeTheme }) {
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
          className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
        >
          Card info
        </label>
        <div className="space-y-2.5">
          {card.due_date && (
            <MetaRow
              icon={faCalendarDays}
              label="Due"
              value={new Date(card.due_date).toLocaleDateString()}
              activeTheme={activeTheme}
            />
          )}
          {card.ease_factor != null && (
            <MetaRow
              icon={faGaugeHigh}
              label="Ease factor"
              value={Number(card.ease_factor).toFixed(2)}
              activeTheme={activeTheme}
            />
          )}
          {card.repetitions != null && (
            <MetaRow
              icon={faRepeat}
              label="Repetitions"
              value={card.repetitions}
              activeTheme={activeTheme}
            />
          )}
          {card.review_interval != null && (
            <MetaRow
              icon={faCalendarDays}
              label="Interval"
              value={`${card.review_interval} day${card.review_interval !== 1 ? "s" : ""}`}
              activeTheme={activeTheme}
            />
          )}
        </div>
      </section>
    </>
  );
}
