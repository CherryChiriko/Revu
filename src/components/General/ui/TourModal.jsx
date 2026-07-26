import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faEye,
  faFileText,
} from "@fortawesome/free-solid-svg-icons";
import { App as CapacitorApp } from "@capacitor/app"; // 👈 Added import
import { Capacitor } from "@capacitor/core"; // 👈 Added import

export default function TourModal({
  activeTheme,
  steps,
  tour,
  onClose,
  renderDemo,
  finishedContent,
}) {
  const { step, finished, isLastStep, handleNext, handleBack, handleFinish } =
    tour;

  const [showDemo, setShowDemo] = React.useState(false);

  const current = steps[step];
  const stepIcon = current?.icon;
  const isImageIcon = typeof stepIcon === "string";
  const hasDemo = typeof renderDemo === "function" && renderDemo(step) != null;

  React.useEffect(() => {
    setShowDemo(false);
  }, [step]);

  React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Intercept phone hardware back button while modal is active
    const listener = CapacitorApp.addListener("backButton", () => {
      if (onClose) onClose();
      else handleFinish();
    });

    return () => {
      listener.then((handler) => handler.remove());
    };
  }, [onClose, handleFinish]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <div
        className={`w-full max-w-md rounded-2xl ${activeTheme.background.card} shadow-xl overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[600px]`}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm ${activeTheme.text.secondary}`}>
              {finished ? "All set" : `Step ${step + 1} of ${steps.length}`}
            </span>
            {!finished && (
              <button
                type="button"
                onClick={handleFinish}
                className={`text-sm ${activeTheme.text.muted} hover:${activeTheme.text.secondary} transition-colors px-3 py-1.5 rounded-md min-h-8`}
              >
                Skip
              </button>
            )}
          </div>
          <div
            className={`h-1 w-full rounded-full ${activeTheme.background.track} overflow-hidden mb-4`}
          >
            <div
              className={`h-full rounded-full bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} transition-all duration-300 ease-out`}
              style={{
                width: finished
                  ? "100%"
                  : `${((step + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-7 pb-4 flex-1 min-h-0 overflow-y-auto">
          {!finished ? (
            <div className="flex flex-col h-full">
              {/* Icon + Title */}
              <div className="flex items-center justify-between min-h-[56px] mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  {stepIcon && (
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${activeTheme.gradients.from}/15 ${activeTheme.gradients.to}/15 overflow-hidden shrink-0`}
                    >
                      {isImageIcon ? (
                        <img
                          src={stepIcon}
                          alt=""
                          className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={stepIcon}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTheme.text.accent3}`}
                        />
                      )}
                    </div>
                  )}
                  <h2
                    id="tour-title"
                    className={`text-sm sm:text-base font-medium ${activeTheme.text.primary} truncate`}
                  >
                    {current.title}
                  </h2>
                </div>

                {hasDemo && (
                  <button
                    type="button"
                    onClick={() => setShowDemo(!showDemo)}
                    className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${activeTheme.border.secondary} ${activeTheme.background.secondary} ${activeTheme.text.accent3} hover:opacity-90 transition-opacity min-h-8`}
                  >
                    <FontAwesomeIcon
                      icon={showDemo ? faFileText : faEye}
                      className="w-3 h-3"
                    />
                    {showDemo ? "Description" : "Demo"}
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                {showDemo && hasDemo ? (
                  <div className="w-full h-full flex items-center justify-center min-h-[140px]">
                    {renderDemo(step)}
                  </div>
                ) : (
                  <p
                    className={`text-sm leading-relaxed whitespace-pre-line w-full self-start pt-2 ${activeTheme.text.secondary}`}
                  >
                    {current.body}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-4 flex items-center justify-center bg-gradient-to-br ${activeTheme.gradients.from}/15 ${activeTheme.gradients.to}/15`}
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  className={`w-6 h-6 sm:w-7 sm:h-7 ${activeTheme.text.accent3}`}
                />
              </div>
              <p
                className={`text-sm sm:text-[15px] ${activeTheme.text.secondary}`}
              >
                {finishedContent?.body ?? "You're all set."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!finished && (
          <div
            className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t shrink-0 ${activeTheme.border.muted}`}
          >
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              aria-label="Previous step"
              className={`p-2.5 sm:p-2 rounded-md transition-colors min-h-10 min-w-10 flex items-center justify-center ${
                step === 0
                  ? "invisible"
                  : `${activeTheme.text.secondary} hover:${activeTheme.background.secondary}`
              }`}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            </button>

            <div className="flex gap-1.5">
              {steps.map((_, i) => (
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
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 sm:px-4 sm:py-2 text-sm font-medium min-h-10 ${activeTheme.text.activeButton} ${activeTheme.button.primary} active:scale-95 transition-transform`}
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
            className={`flex justify-end px-4 sm:px-6 py-3 sm:py-4 border-t shrink-0 ${activeTheme.border.muted}`}
          >
            <button
              type="button"
              onClick={handleFinish}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 sm:px-4 sm:py-2 text-sm font-medium min-h-10 ${activeTheme.text.activeButton} ${activeTheme.button.primary} active:scale-95 transition-transform`}
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
