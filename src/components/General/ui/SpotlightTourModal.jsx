import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const PAD = 10;
const POPOVER_WIDTH = 340;
const GAP = 16;
const ESTIMATED_POPOVER_HEIGHT = 200; // Defensive threshold layout calculation value

export default function SpotlightTourModal({ activeTheme, steps, refs, tour }) {
  const { step, isLastStep, handleNext, handleBack, handleFinish } = tour;
  const [rect, setRect] = useState(null);
  const current = steps[step];

  // Measures the size and positioning coords of the targeted live element
  const updateRect = useCallback(() => {
    if (!refs) return;
    const el = refs[current?.target]?.current;
    if (el) setRect(el.getBoundingClientRect());
  }, [current, refs]);

  // Smooth scrolls targeted interface element directly into view frames
  useEffect(() => {
    if (!refs) return;
    const el = refs[current?.target]?.current;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });

    const timeoutId = setTimeout(updateRect, 300);
    return () => clearTimeout(timeoutId);
  }, [step, updateRect, refs]);

  // Handle dimensional screen adjustments seamlessly
  useEffect(() => {
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [updateRect]);

  if (!rect) return null;

  // Viewport structural grid definitions
  const viewportH = window.innerHeight;
  const viewportW = window.innerWidth;

  // Calculate open real estate in all 4 directions relative to the padded target area
  const spaceBelow = viewportH - (rect.bottom + PAD);
  const spaceAbove = rect.top - PAD;
  const spaceRight = viewportW - (rect.right + PAD);
  const spaceLeft = rect.left - PAD;

  // Priority Ranking Engine: Default to "Below" if it fits comfortably.
  // Otherwise, calculate the absolute largest available clearing vector block.
  let placement = "bottom";

  if (spaceBelow < ESTIMATED_POPOVER_HEIGHT + GAP) {
    const spaces = [
      { side: "bottom", val: spaceBelow },
      { side: "top", val: spaceAbove },
      { side: "right", val: spaceRight },
      { side: "left", val: spaceLeft },
    ];
    // Sort directions to locate the absolute largest open pocket
    spaces.sort((a, b) => b.val - a.val);
    placement = spaces[0].side;
  }

  // Calculate absolute coordinates based on the designated space sector winner
  let popoverTop = 0;
  let popoverLeft = 0;

  switch (placement) {
    case "top":
      popoverTop = rect.top - PAD - ESTIMATED_POPOVER_HEIGHT - GAP;
      // Center horizontally relative to the target item anchor point
      popoverLeft = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
      break;

    case "right":
      // Center vertically relative to target center axis
      popoverTop = rect.top + rect.height / 2 - ESTIMATED_POPOVER_HEIGHT / 2;
      popoverLeft = rect.right + PAD + GAP;
      break;

    case "left":
      // Center vertically relative to target center axis
      popoverTop = rect.top + rect.height / 2 - ESTIMATED_POPOVER_HEIGHT / 2;
      popoverLeft = rect.left - PAD - POPOVER_WIDTH - GAP;
      break;

    case "bottom":
    default:
      popoverTop = rect.bottom + PAD + GAP;
      // Center horizontally relative to the target item anchor point
      popoverLeft = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
      break;
  }

  // Safety Boundary Guardrails: Protect component layout from bleeding offscreen edges
  popoverTop = Math.max(
    GAP,
    Math.min(popoverTop, viewportH - ESTIMATED_POPOVER_HEIGHT - GAP),
  );
  popoverLeft = Math.max(
    GAP,
    Math.min(popoverLeft, viewportW - POPOVER_WIDTH - GAP),
  );
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      {/* Dark overlay with a spotlight cutout around the target */}
      <div
        className="fixed pointer-events-none transition-all duration-300 ease-out"
        style={{
          top: rect.top - PAD,
          left: rect.left - PAD,
          width: rect.width + PAD * 2,
          height: rect.height + PAD * 2,
          borderRadius: 16,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
        }}
      />

      {/* Accent ring around the highlighted element */}
      <div
        className={`fixed pointer-events-none transition-all duration-300 ease-out rounded-2xl ring-4 ${activeTheme.ring?.focus || "ring-indigo-500"}`}
        style={{
          top: rect.top - PAD,
          left: rect.left - PAD,
          width: rect.width + PAD * 2,
          height: rect.height + PAD * 2,
        }}
      />

      {/* Click-blocker backdrop layout element */}
      <div className="fixed inset-0" onClick={handleFinish} />

      {/* Popover Dialogue Card */}
      <div
        className={`fixed rounded-2xl shadow-xl overflow-hidden border flex flex-col
          ${activeTheme.background.secondary} ${activeTheme.border.secondary} relative z-10 transition-all duration-300 ease-out`}
        style={{
          top: popoverTop,
          left: popoverLeft,
          width: POPOVER_WIDTH,
          maxHeight: `${Math.min(400, viewportH - GAP * 2)}px`, // Safeguard viewport caps dynamically
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Structure matching Modal template styling */}
        <div
          className={`flex items-start justify-between px-4 pt-3 pb-2 border-b ${activeTheme.border.muted}`}
        >
          <div className="flex flex-col text-left">
            <h2
              className={`text-sm font-bold flex items-center gap-2 ${activeTheme.text.primary}`}
            >
              {current.icon && (
                <FontAwesomeIcon
                  icon={current.icon}
                  className={`w-3.5 h-3.5 ${activeTheme.text.accent1}`}
                />
              )}
              {current.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className={`p-1 -mr-1 -mt-1 rounded-lg transition-colors outline-none focus:ring-2 ${activeTheme.link.hoverBg} ${activeTheme.ring.focus} ${activeTheme.text.secondary}`}
            aria-label="close tour"
          >
            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5 block" />
          </button>
        </div>

        {/* Dynamic Scrollable Content Body Area */}
        <div className="px-4 pt-4 pb-2 overflow-y-auto custom-scrollbar flex-1 text-left">
          <p
            className={`text-xs leading-relaxed whitespace-pre-line ${activeTheme.text.secondary}`}
          >
            {current.body}
          </p>
        </div>

        {/* Action Controls Footer Drawer */}
        <div
          className={`flex items-center justify-between px-4 py-2 border-t bg-black/5 dark:bg-white/5 ${activeTheme.border.muted}`}
        >
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            aria-label="Previous"
            className={`p-1.5 rounded-lg transition-colors ${
              step === 0
                ? "invisible"
                : `${activeTheme.text.secondary} hover:${activeTheme.link.hoverBg}`
            }`}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
          </button>

          {/* Dots Indicator Tracking Area */}
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
            onClick={isLastStep ? handleFinish : handleNext}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-transform active:scale-95 ${activeTheme.text.activeButton} ${activeTheme.button.primary}`}
          >
            {isLastStep ? "Done" : "Next"}
            <FontAwesomeIcon
              icon={isLastStep ? faCheck : faArrowRight}
              className="w-3 h-3"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
