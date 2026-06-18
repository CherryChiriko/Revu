import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faLayerGroup,
  faCheckCircle,
  faExclamationCircle,
  faRightLeft,
  faLanguage,
  faCopy,
  faFire,
  faChevronRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useQuickCreate, CLONE_TYPES, C_FIELDS } from "./hooks/useQuickCreate";

const TYPE_ICONS = {
  swap: faRightLeft,
  c_to_a: faLanguage,
  merge: faCopy,
  missed: faFire,
};

const AccentStripe = ({ activeTheme }) => (
  <div
    className={`h-1 w-full bg-gradient-to-r ${activeTheme.gradients.from} via-indigo-500 ${activeTheme.gradients.to}`}
  />
);

const inputCls = (activeTheme) =>
  `w-full rounded-xl py-2.5 px-3.5 text-sm border outline-none focus:ring-2 transition-all
   ${activeTheme.background.canvas} ${activeTheme.text.primary}
   ${activeTheme.border.card} ${activeTheme.ring?.input ?? "focus:ring-violet-300"}`;

const selectCls = (activeTheme) => `${inputCls(activeTheme)} appearance-none`;

// ─── Step 1: Pick source deck + clone type ────────────────────────────────────

function StepDeck({ logic, activeTheme }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
          Source deck
        </p>
        <div className="relative">
          <FontAwesomeIcon
            icon={faLayerGroup}
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${activeTheme.text.muted}`}
          />
          <select
            value={logic.selectedDeckId}
            onChange={(e) => {
              logic.setSelectedDeckId(e.target.value);
              logic.selectCloneType(null);
            }}
            className={`${selectCls(activeTheme)} pl-8`}
          >
            <option value="" disabled>
              Choose a deck…
            </option>
            {logic.decks.map((d) => (
              <option key={d.deck_id} value={d.deck_id}>
                {d.name} · {d.language} · Mode {d.study_mode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {logic.selectedDeckId && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Clone type
          </p>
          <div className="space-y-2">
            {logic.availableTypes.map((type) => {
              const isActive = logic.cloneTypeId === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => logic.selectCloneType(type.id)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border transition-all
                    ${
                      isActive
                        ? `border-violet-400 ring-2 ring-violet-300/40 ${activeTheme.background.canvas}`
                        : `${activeTheme.border.card} ${activeTheme.background.canvas} hover:border-violet-300`
                    }`}
                >
                  <div
                    className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                    ${isActive ? "bg-violet-500/20 text-violet-400" : `${activeTheme.background.secondary} ${activeTheme.text.muted}`}`}
                  >
                    <FontAwesomeIcon
                      icon={TYPE_ICONS[type.id]}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold ${activeTheme.text.primary}`}
                    >
                      {type.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${activeTheme.text.muted}`}>
                      {type.description}
                    </p>
                  </div>
                  {isActive && (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-violet-400 mt-0.5 shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Configure options ────────────────────────────────────────────────

function StepOptions({ logic, activeTheme }) {
  return (
    <div className="space-y-5">
      {/* Deck name */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
          New deck name
        </p>
        <input
          type="text"
          value={logic.newDeckName}
          onChange={(e) => logic.setNewDeckName(e.target.value)}
          placeholder="Enter a name…"
          className={inputCls(activeTheme)}
          autoFocus
        />
      </div>

      {/* C→A field mapping */}
      {logic.cloneTypeId === "c_to_a" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Field mapping
          </p>
          <p className={`text-xs ${activeTheme.text.muted} mb-3`}>
            Choose which Chinese fields become the front and back of the new
            standard cards.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p
                className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted} mb-1`}
              >
                Front
              </p>
              <select
                value={logic.frontField}
                onChange={(e) => logic.setFrontField(e.target.value)}
                className={selectCls(activeTheme)}
              >
                {C_FIELDS.filter((f) => f.value !== logic.backField).map(
                  (f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <p
                className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.text.muted} mb-1`}
              >
                Back
              </p>
              <select
                value={logic.backField}
                onChange={(e) => logic.setBackField(e.target.value)}
                className={selectCls(activeTheme)}
              >
                {C_FIELDS.filter((f) => f.value !== logic.frontField).map(
                  (f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
          {/* Live preview */}
          <div
            className={`mt-3 flex items-center gap-2 text-xs ${activeTheme.text.muted} px-3 py-2 rounded-lg ${activeTheme.background.canvas} border ${activeTheme.border.card}`}
          >
            <span className={`font-semibold ${activeTheme.text.primary}`}>
              {C_FIELDS.find((f) => f.value === logic.frontField)?.label}
            </span>
            <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
            <span>
              {C_FIELDS.find((f) => f.value === logic.backField)?.label}
            </span>
          </div>
        </div>
      )}

      {/* Missed cards limit */}
      {logic.cloneTypeId === "missed" && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Card limit
            </p>
            <span className={`text-sm font-bold ${activeTheme.text.primary}`}>
              {logic.missedLimit} cards
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={logic.missedLimit}
            onChange={(e) => logic.setMissedLimit(Number(e.target.value))}
            className="w-full"
          />
          <p className={`text-xs ${activeTheme.text.muted} mt-2`}>
            Selects your {logic.missedLimit} cards with the lowest ease factor —
            the ones SRS considers hardest.
          </p>
        </div>
      )}

      {/* Summary chip */}
      <div
        className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl border ${activeTheme.border.card} ${activeTheme.background.canvas}`}
      >
        <FontAwesomeIcon
          icon={TYPE_ICONS[logic.cloneTypeId]}
          className={activeTheme.text.muted}
        />
        <span className={activeTheme.text.muted}>
          Cloning{" "}
          <span className={`font-semibold ${activeTheme.text.primary}`}>
            "{logic.selectedDeck?.name}"
          </span>{" "}
          as{" "}
          <span className={`font-semibold ${activeTheme.text.primary}`}>
            "{logic.newDeckName || "…"}"
          </span>{" "}
          · Output: Mode A
        </span>
      </div>

      {logic.error && (
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <FontAwesomeIcon icon={faExclamationCircle} />
          {logic.error}
        </div>
      )}
    </div>
  );
}

// ─── Success view ─────────────────────────────────────────────────────────────

function SuccessView({ logic, activeTheme }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="w-14 h-14 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-2xl">
        <FontAwesomeIcon icon={faCheckCircle} />
      </div>
      <div>
        <p className={`font-semibold ${activeTheme.text.primary}`}>
          Deck cloned!
        </p>
        <p className={`text-sm mt-1 ${activeTheme.text.muted}`}>
          <span className="font-medium">{logic.newDeckName}</span> is ready to
          study.
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        <button
          onClick={logic.reset}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border ${activeTheme.border.card} ${activeTheme.text.secondary} hover:bg-black/5 transition-colors`}
        >
          Clone another
        </button>
        <button
          onClick={logic.handleClose}
          className={`px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} text-white`}
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function CloneDeckModal({
  activeTheme,
  isOpen,
  onClose,
  onBack,
}) {
  const logic = useQuickCreate(onClose);

  if (!isOpen) return null;

  const step = !logic.cloneTypeId ? 1 : 2;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => e.target === e.currentTarget && logic.handleClose()}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden border
        ${activeTheme.background.secondary} ${activeTheme.border.card}`}
      >
        <AccentStripe activeTheme={activeTheme} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            {/* Back to path picker if coming from QuickCreateModal */}
            {onBack && !logic.success && (
              <button
                onClick={onBack}
                className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${activeTheme.text.muted}`}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
              </button>
            )}
            <div>
              <h2 className={`text-base font-bold ${activeTheme.text.primary}`}>
                Clone Deck
              </h2>
              {!logic.success && (
                <p className={`text-xs mt-0.5 ${activeTheme.text.muted}`}>
                  {step === 1
                    ? "Select a deck and clone type"
                    : "Configure your clone"}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={logic.handleClose}
            className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${activeTheme.text.secondary}`}
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          {logic.success ? (
            <SuccessView logic={logic} activeTheme={activeTheme} />
          ) : step === 1 ? (
            <>
              <StepDeck logic={logic} activeTheme={activeTheme} />
              <div className="flex justify-end pt-2">
                <button
                  disabled={!logic.cloneTypeId}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5
                    bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} text-white
                    disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Next
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
              </div>
            </>
          ) : (
            <>
              <StepOptions logic={logic} activeTheme={activeTheme} />
              <div className="flex justify-between pt-2">
                <button
                  onClick={() => logic.selectCloneType(null)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border ${activeTheme.border.card} ${activeTheme.text.secondary}`}
                >
                  Back
                </button>
                <button
                  onClick={logic.submit}
                  disabled={!logic.isValid || logic.isSubmitting}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2
                    bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} text-white
                    disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {logic.isSubmitting ? (
                    <>
                      <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                      Cloning…
                    </>
                  ) : (
                    "Clone Deck"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
