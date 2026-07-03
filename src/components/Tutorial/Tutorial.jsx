import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableCellsLarge,
  faLayerGroup,
  faChartLine,
  faRocket,
  faArrowLeft,
  faArrowRight,
  faCheck,
  faRotate,
  faHandPointer,
} from "@fortawesome/free-solid-svg-icons";
import { completeOnboarding } from "../../slices/userSlice"; // adjust path if needed

/* ---------------------------------------------------------------------- */
/*  Demo: Mode A — standard flip card                                     */
/* ---------------------------------------------------------------------- */

function FlipCardDemo({ activeTheme }) {
  const [flipped, setFlipped] = useState(false);
  const [encounter, setEncounter] = useState("first"); // "first" | "review"
  const [rated, setRated] = useState(false);

  const handleCardClick = () => {
    if (encounter === "review" && rated) return; // wait for reset
    setFlipped((f) => !f);
  };

  const handleGotIt = () => {
    setEncounter("review");
    setFlipped(false);
  };

  const handleRate = () => {
    setRated(true);
  };

  const handleResetDemo = () => {
    setEncounter("first");
    setFlipped(false);
    setRated(false);
  };

  const ratingButtons = [
    { label: "Again", className: activeTheme.button.danger },
    { label: "Hard", className: activeTheme.button.secondary },
    { label: "Good", className: activeTheme.button.accent2 },
    { label: "Easy", className: activeTheme.button.primary },
  ];

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleCardClick}
        aria-label={flipped ? "Show front of card" : "Show back of card"}
        className="w-full h-32 [perspective:1000px] focus:outline-none"
      >
        <div
          className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-xl border ${activeTheme.border.secondary} ${activeTheme.background.secondary} [backface-visibility:hidden]`}
          >
            <span className={`text-xl font-medium ${activeTheme.text.primary}`}>
              Bonjour
            </span>
          </div>
          {/* Back */}
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-xl border ${activeTheme.border.secondary} ${activeTheme.background.secondary} [backface-visibility:hidden]`}
            style={{ transform: "rotateY(180deg)" }}
          >
            <span className={`text-xl font-medium ${activeTheme.text.accent3}`}>
              Hello
            </span>
          </div>
        </div>
      </button>

      {/* First encounter: just learn it */}
      {encounter === "first" && (
        <div className="mt-3 flex flex-col items-center gap-2">
          <p
            className={`flex items-center gap-1.5 text-xs ${activeTheme.text.muted}`}
          >
            <FontAwesomeIcon icon={faHandPointer} className="w-3.5 h-3.5" />
            {flipped
              ? "First time seeing this card — just study it"
              : "Tap the card to see the back"}
          </p>
          {flipped && (
            <button
              type="button"
              onClick={handleGotIt}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium ${activeTheme.text.activeButton} ${activeTheme.button.primary}`}
            >
              Got it
            </button>
          )}
        </div>
      )}

      {/* Later encounter: rate recollection */}
      {encounter === "review" && !rated && (
        <div className="mt-3 flex flex-col items-center gap-2 w-full">
          <p className={`text-xs text-center ${activeTheme.text.muted}`}>
            {flipped
              ? "Seen it before — how well did you remember?"
              : "Next time it's due, tap to reveal, then rate yourself"}
          </p>
          {flipped && (
            <div className="grid grid-cols-4 gap-1.5 w-full">
              {ratingButtons.map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={handleRate}
                  className={`rounded-lg py-1.5 text-[11px] font-medium ${activeTheme.text.activeButton} ${btn.className}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {encounter === "review" && rated && (
        <div className="mt-3 flex flex-col items-center gap-2">
          <p
            className={`flex items-center gap-1.5 text-xs ${activeTheme.text.secondary}`}
          >
            <FontAwesomeIcon
              icon={faCheck}
              className={`w-3.5 h-3.5 ${activeTheme.text.accent3}`}
            />
            Revu schedules the next review based on that rating
          </p>
          <button
            type="button"
            onClick={handleResetDemo}
            className={`flex items-center gap-1 text-xs ${activeTheme.text.accent3} hover:opacity-80 transition-opacity`}
          >
            <FontAwesomeIcon icon={faRotate} className="w-3 h-3" />
            Replay demo
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Demo: Mode C — stroke-order stand-in (lightweight SVG, no HanziWriter) */
/* ---------------------------------------------------------------------- */

const STROKE_PATHS = [
  "M 50 15 L 20 85", // left leg
  "M 50 40 L 78 85", // right leg
];

function StrokeOrderDemo({ activeTheme }) {
  const [phase, setPhase] = useState("animation"); // "animation" | "outline" | "quiz"
  const [playKey, setPlayKey] = useState(0);
  const [interacted, setInteracted] = useState(false);

  const accentColor = activeTheme.isDark ? "#818cf8" : "#6366f1"; // indigo-400 / indigo-500
  const guideColor = activeTheme.isDark ? "#4b5563" : "#d1d5db"; // gray-600 / gray-300

  const phases = [
    { id: "animation", label: "1. Animate" },
    { id: "outline", label: "2. Trace" },
    { id: "quiz", label: "3. Recall" },
  ];

  const handlePhaseChange = (id) => {
    setPhase(id);
    setInteracted(false);
    setPlayKey((k) => k + 1);
  };

  const handleAction = () => {
    setInteracted(true);
    setPlayKey((k) => k + 1);
  };

  const showStrokes = phase === "animation" || interacted;
  const showGuide = phase === "outline";

  const caption = {
    animation:
      "Every new character starts by showing you the correct stroke order.",
    outline: "Next, you trace the character over a faint outline.",
    quiz: "Then you draw it again from memory, with no outline at all.",
  }[phase];

  const actionLabel = {
    animation: "Replay",
    outline: "Trace it",
    quiz: "Draw it",
  }[phase];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Phase tabs */}
      <div className="flex gap-1.5 mb-3">
        {phases.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handlePhaseChange(p.id)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              phase === p.id
                ? `${activeTheme.text.activeButton} ${activeTheme.button.primary}`
                : `${activeTheme.text.muted} ${activeTheme.background.secondary}`
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div
        className={`relative w-36 h-36 rounded-xl border ${activeTheme.border.secondary} ${activeTheme.background.secondary} flex items-center justify-center`}
      >
        <svg
          key={playKey}
          viewBox="0 0 100 100"
          className="w-24 h-24"
          role="img"
          aria-label="Stroke order demo for the character ren, meaning person"
        >
          {/* Faint guide, only during the trace phase */}
          {showGuide &&
            STROKE_PATHS.map((d, i) => (
              <path
                key={`guide-${i}`}
                d={d}
                fill="none"
                stroke={guideColor}
                strokeWidth="8"
                strokeLinecap="round"
              />
            ))}

          {/* Drawn strokes: auto in animation phase, on-demand in outline/quiz */}
          {showStrokes &&
            STROKE_PATHS.map((d, i) => (
              <path
                key={`stroke-${i}`}
                d={d}
                fill="none"
                stroke={accentColor}
                strokeWidth="8"
                strokeLinecap="round"
                pathLength="1"
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: 1,
                  animation: `revu-draw-stroke 0.5s ease-out ${i * 0.5}s forwards`,
                }}
              />
            ))}

          <style>{`
            @keyframes revu-draw-stroke {
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className={`text-sm ${activeTheme.text.secondary}`}>
          rén <span className={activeTheme.text.muted}>— person</span>
        </span>
        <button
          type="button"
          onClick={handleAction}
          className={`flex items-center gap-1 text-xs ${activeTheme.text.accent3} hover:opacity-80 transition-opacity`}
        >
          <FontAwesomeIcon icon={faRotate} className="w-3 h-3" />
          {actionLabel}
        </button>
      </div>

      {phase !== "animation" && interacted && (
        <p
          className={`mt-1.5 flex items-center gap-1.5 text-xs ${activeTheme.text.secondary}`}
        >
          <FontAwesomeIcon
            icon={faCheck}
            className={`w-3.5 h-3.5 ${activeTheme.text.accent3}`}
          />
          {phase === "outline"
            ? "Nice — traced correctly"
            : "Graded on accuracy"}
        </p>
      )}

      <p className={`mt-2 text-xs text-center ${activeTheme.text.muted}`}>
        {caption}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Step definitions                                                      */
/* ---------------------------------------------------------------------- */

const STEPS = [
  {
    icon: faTableCellsLarge,
    title: "Welcome to Revu",
    body: "Revu uses spaced repetition to help you learn and remember. Cards you know well show up less often, and cards you struggle with come back sooner.",
  },
  {
    icon: null,
    title: "Standard cards",
    body: "The first time you see a card, it's just to learn it. From then on, each time it's due you rate how well you remembered it — that rating is what schedules the next review.",
    demo: FlipCardDemo,
  },
  {
    icon: null,
    title: "Character cards",
    body: "Character cards walk you through three phases for every character. Explore them below.",
    demo: StrokeOrderDemo,
  },
  {
    icon: faLayerGroup,
    title: "Decks are your collections",
    body: "Group related cards into a deck. Build one from scratch, import a list, or duplicate an existing deck to remix it.",
  },
  {
    icon: faChartLine,
    title: "Cards mature as you review",
    body: "Every card moves through four stages: new, learning, reviewing, and mastered. Review honestly — the schedule adjusts automatically based on how you do.",
  },
  {
    icon: faRocket,
    title: "You're ready to go",
    body: "Create your first deck, add a few cards, and start a study session whenever you like. Your streak and XP update as you go.",
  },
];

/* ---------------------------------------------------------------------- */
/*  OnboardingModal                                                        */
/* ---------------------------------------------------------------------- */

/**
 * Six-step interactive walkthrough shown to first-time users.
 * Rendered from App.jsx once the profile has loaded, gated on
 * `profile && !profile.has_completed_onboarding`. Requires activeTheme
 * as a prop — every visual token here comes from that object, nothing
 * is hardcoded.
 *
 * Closing (skip or finishing) dispatches completeOnboarding, which
 * optimistically updates Redux and persists has_completed_onboarding
 * to the profiles table, rolling back on failure.
 */
export default function OnboardingModal({ activeTheme, onClose }) {
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const isLastStep = step === STEPS.length - 1;
  const current = STEPS[step];
  const stepIcon = current.icon;
  const Demo = current.demo;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleSkip();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handleBack();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, finished]);

  const finish = () => {
    dispatch(completeOnboarding());
    onClose?.();
  };

  const handleNext = () => {
    if (finished) return;
    if (isLastStep) {
      setFinished(true);
    } else {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    if (finished) return;
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSkip = () => {
    finish();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        className={`w-full max-w-md rounded-2xl ${activeTheme.background.card} shadow-xl overflow-hidden`}
      >
        {/* Header: progress + skip */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm ${activeTheme.text.secondary}`}>
              {finished ? "All set" : `Step ${step + 1} of ${STEPS.length}`}
            </span>
            {!finished && (
              <button
                type="button"
                onClick={handleSkip}
                className={`text-sm ${activeTheme.text.muted} hover:${activeTheme.text.secondary} transition-colors px-2 py-1 rounded-md`}
              >
                Skip
              </button>
            )}
          </div>
          <div
            className={`h-1 w-full rounded-full ${activeTheme.background.track} overflow-hidden mb-6`}
          >
            <div
              className={`h-full rounded-full bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} transition-all duration-300 ease-out`}
              style={{
                width: finished
                  ? "100%"
                  : `${((step + 1) / STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-7 pb-6 min-h-[300px] flex flex-col">
          {!finished ? (
            <>
              {stepIcon && (
                <div
                  className={`w-14 h-14 rounded-2xl mb-5 flex items-center justify-center bg-gradient-to-br ${activeTheme.gradients.from}/15 ${activeTheme.gradients.to}/15`}
                >
                  <FontAwesomeIcon
                    icon={stepIcon}
                    className={`w-7 h-7 ${activeTheme.text.accent3}`}
                  />
                </div>
              )}
              <h2
                id="onboarding-title"
                className={`text-lg font-medium mb-2 ${activeTheme.text.primary}`}
              >
                {current.title}
              </h2>
              <p
                className={`text-[15px] leading-relaxed mb-4 ${activeTheme.text.secondary}`}
              >
                {current.body}
              </p>
              {Demo && (
                <div className="mt-1">
                  <Demo activeTheme={activeTheme} />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div
                className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center bg-gradient-to-br ${activeTheme.gradients.from}/15 ${activeTheme.gradients.to}/15`}
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  className={`w-7 h-7 ${activeTheme.text.accent3}`}
                />
              </div>
              <p className={`text-[15px] ${activeTheme.text.secondary}`}>
                Tutorial closed. Time to build your first deck.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!finished && (
          <div
            className={`flex items-center justify-between px-6 py-4 border-t ${activeTheme.border.muted}`}
          >
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              aria-label="Previous step"
              className={`p-2 rounded-md transition-colors ${
                step === 0
                  ? "invisible"
                  : `${activeTheme.text.secondary} hover:${activeTheme.background.secondary}`
              }`}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            </button>

            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === step
                      ? activeTheme.background.accent3
                      : activeTheme.background.track
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium ${activeTheme.text.activeButton} ${activeTheme.button.primary}`}
            >
              {isLastStep ? "Get started" : "Next"}
              {!isLastStep && (
                <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        {finished && (
          <div
            className={`flex justify-end px-6 py-4 border-t ${activeTheme.border.muted}`}
          >
            <button
              type="button"
              onClick={finish}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium ${activeTheme.text.activeButton} ${activeTheme.button.primary}`}
            >
              <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
