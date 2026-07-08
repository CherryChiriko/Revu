import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useOnboarding } from "./hooks/useOnboarding";
import { ONBOARDING_STEPS } from "./constants/onboardingSteps";

export default function OnboardingModal({ activeTheme, onClose }) {
  const { step, finished, isLastStep, handleNext, handleBack, handleFinish } =
    useOnboarding(ONBOARDING_STEPS.length, onClose);

  const current = ONBOARDING_STEPS[step];
  const DemoComponent = current?.demo;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-all ${activeTheme.background.card}`}
      >
        {/* Progress Tracker Topbar Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.text.secondary}`}
            >
              {finished
                ? "All set"
                : `Step ${step + 1} of ${ONBOARDING_STEPS.length}`}
            </span>
            {!finished && (
              <button
                type="button"
                onClick={handleFinish}
                className={`text-xs font-bold transition-all ${activeTheme.text.muted} hover:${activeTheme.text.secondary}`}
              >
                Skip
              </button>
            )}
          </div>
          <div
            className={`h-1.5 w-full rounded-full overflow-hidden mb-6 ${activeTheme.background.track}`}
          >
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ease-out ${activeTheme.gradients.from} ${activeTheme.gradients.to}`}
              style={{
                width: finished
                  ? "100%"
                  : `${((step + 1) / ONBOARDING_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Dynamic Presentation Body */}
        <div className="px-6 pb-6 min-h-[320px] flex flex-col justify-between">
          {!finished ? (
            <div className="space-y-4">
              {current.icon && (
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${activeTheme.gradients.from}/10 ${activeTheme.gradients.to}/10`}
                >
                  <FontAwesomeIcon
                    icon={current.icon}
                    className={`w-6 h-6 ${activeTheme.text.accent3}`}
                  />
                </div>
              )}

              <div>
                <h2
                  className={`text-xl font-bold mb-1.5 ${activeTheme.text.primary}`}
                >
                  {current.title}
                </h2>
                <p
                  className={`text-sm leading-relaxed ${activeTheme.text.secondary}`}
                >
                  {current.body}
                </p>
              </div>

              {DemoComponent && (
                <div
                  className={`mt-2 p-4 rounded-xl border ${activeTheme.background.canvas} ${activeTheme.border.card}`}
                >
                  <DemoComponent activeTheme={activeTheme} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-3">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${activeTheme.gradients.from}/20 ${activeTheme.gradients.to}/20`}
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  className={`w-6 h-6 ${activeTheme.text.accent3}`}
                />
              </div>
              <p
                className={`text-sm font-medium ${activeTheme.text.secondary}`}
              >
                Tutorial completed successfully! Let&rsquo;s start building your
                collection.
              </p>
            </div>
          )}
        </div>

        {/* Navigation Action Footer Control Bar */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t ${activeTheme.border.muted} ${activeTheme.background.canvas}`}
        >
          {!finished ? (
            <>
              <button
                type="button"
                onClick={handleBack}
                className={`p-2 rounded-lg transition-colors ${step === 0 ? "opacity-0 pointer-events-none" : `${activeTheme.text.secondary} hover:${activeTheme.background.secondary}`}`}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
              </button>

              <div className="flex gap-2">
                {ONBOARDING_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? `scale-125 ${activeTheme.background.accent3}` : activeTheme.background.track}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 ${activeTheme.text.activeButton} ${activeTheme.button.primary}`}
              >
                {isLastStep ? "Get started" : "Next"}
                {!isLastStep && (
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="w-3.5 h-3.5"
                  />
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold shadow-md ${activeTheme.text.activeButton} ${activeTheme.button.primary}`}
            >
              <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
