import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPlus,
  faCheckCircle,
  faExclamationCircle,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { useQuickCreateLogic } from "../hooks/useAddCard";

/** Thin accent stripe that mirrors the Dashboard/Settings header treatment */
const AccentStripe = ({ activeTheme }) => (
  <div
    className={`h-1 w-full rounded-t-2xl ${activeTheme.gradient?.accent ?? "bg-gradient-to-r from-violet-400 to-blue-400"}`}
  />
);

const Field = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = (activeTheme) =>
  `w-full rounded-xl py-2.5 px-3.5 text-sm border outline-none focus:ring-2
   ${activeTheme.background.canvas} ${activeTheme.text.primary}
   ${activeTheme.border.default} ${activeTheme.ring?.input ?? "focus:ring-violet-300"}
   transition-all duration-150`;

export default function QuickCreate({ activeTheme, isOpen, onClose }) {
  const logic = useQuickCreateLogic(onClose);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => e.target === e.currentTarget && logic.handleClose()}
    >
      {/* Panel */}
      <div
        className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden
          ${activeTheme.background.card ?? activeTheme.background.canvas}`}
      >
        <AccentStripe activeTheme={activeTheme} />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faPlus}
              className={`text-sm ${activeTheme.text.accent ?? activeTheme.text.primary}`}
            />
            <h2 className={`text-base font-bold ${activeTheme.text.primary}`}>
              Quick Create
            </h2>
          </div>
          <button
            onClick={logic.handleClose}
            className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${activeTheme.text.secondary}`}
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 pb-6 space-y-4">
          {/* ── Success state ── */}
          {logic.success ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-14 h-14 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-2xl">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <p className={`font-semibold ${activeTheme.text.primary}`}>
                Card added!
              </p>
              <p className={`text-sm ${activeTheme.text.secondary}`}>
                It's been added to{" "}
                <span className="font-medium">{logic.selectedDeck?.name}</span>{" "}
                and is ready to study.
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={logic.reset}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border
                    ${activeTheme.border.default} ${activeTheme.text.secondary}
                    hover:bg-black/5 transition-colors`}
                >
                  Add another
                </button>
                <button
                  onClick={logic.handleClose}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold
                    ${activeTheme.button.accent2 ?? activeTheme.button.primary}
                    transition-colors`}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ── Deck picker ── */}
              <Field label="Deck" required>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faLayerGroup}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${activeTheme.text.muted}`}
                  />
                  <select
                    value={logic.selectedDeckId}
                    onChange={(e) => {
                      logic.setSelectedDeckId(e.target.value);
                    }}
                    className={`${inputCls(activeTheme)} pl-8 appearance-none`}
                  >
                    <option value="" disabled>
                      Choose a deck…
                    </option>
                    {logic.decks.map((d) => (
                      <option key={d.deck_id} value={d.deck_id}>
                        {d.name}
                        {d.language ? ` · ${d.language}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>

              {/* ── Card fields — only shown once a deck is chosen ── */}
              {logic.selectedDeckId && (
                <>
                  <Field label="Front" required>
                    <input
                      type="text"
                      value={logic.fields.front}
                      onChange={(e) => logic.setField("front", e.target.value)}
                      placeholder={
                        logic.studyMode === "C"
                          ? "Chinese character(s)"
                          : "Word or phrase"
                      }
                      className={inputCls(activeTheme)}
                      autoFocus
                    />
                  </Field>

                  <Field label="Back" required>
                    <input
                      type="text"
                      value={logic.fields.back}
                      onChange={(e) => logic.setField("back", e.target.value)}
                      placeholder="Meaning or translation"
                      className={inputCls(activeTheme)}
                    />
                  </Field>

                  {/* Reading field — Chinese mode only */}
                  {logic.studyMode === "C" && (
                    <Field label="Reading (Pinyin)">
                      <input
                        type="text"
                        value={logic.fields.reading}
                        onChange={(e) =>
                          logic.setField("reading", e.target.value)
                        }
                        placeholder="e.g. nǐ hǎo  (auto-generated if blank)"
                        className={inputCls(activeTheme)}
                      />
                    </Field>
                  )}
                </>
              )}

              {/* ── Error ── */}
              {logic.error && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  <span>{logic.error}</span>
                </div>
              )}

              {/* ── Footer ── */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={logic.handleClose}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border
                    ${activeTheme.border.default} ${activeTheme.text.secondary}
                    hover:bg-black/5 transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={logic.submit}
                  disabled={!logic.isValid || logic.isSubmitting}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2
                    ${activeTheme.button.accent2 ?? activeTheme.button.primary}
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                >
                  {logic.isSubmitting ? (
                    <>
                      <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPlus} />
                      Add Card
                    </>
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
