import React from "react";

/**
 * A highly versatile, standardized page header with a dynamic theme-based top accent bar.
 *
 * @param {Object} props
 * @param {string} props.title - Main title string displayed on the left.
 * @param {string} [props.description] - Optional subtext or description under the title.
 * @param {Object} props.activeTheme - The active configuration theme object.
 * @param {React.ReactNode} [props.leftElement] - Optional slot for an element placed before the text (e.g., Avatar, Logo).
 * @param {React.ReactNode} [props.rightElement] - Optional slot for an element pushed to the far right (e.g., Logout button, XP Bar).
 * @param {React.ReactNode} [props.children] - Fallback slot for customized layouts inside the header grid.
 */
export default function Header({
  title,
  description,
  activeTheme,
  leftElement,
  rightElement,
  children,
}) {
  // Pull from-to token combinations safely from your theme settings configuration wrapper
  const gradientFrom = activeTheme?.gradients?.from || "from-indigo-500";
  const gradientTo = activeTheme?.gradients?.to || "to-purple-500";

  return (
    <header
      className={`${activeTheme.background.secondary} ${activeTheme.text.primary} rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden relative w-full`}
    >
      {/* Dynamic Top Accent Strip */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full">
        {/* Left Side Content Container */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          {leftElement && <div className="flex-shrink-0">{leftElement}</div>}

          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight py-2">
              {title}
            </h1>
            {description && (
              <p
                className={`${activeTheme.text.secondary} text-sm md:text-base mt-1.5 max-w-2xl leading-relaxed`}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right Side Content Container */}
        {(rightElement || children) && (
          <div className="flex items-center gap-5 flex-shrink-0 w-full md:w-auto justify-start md:justify-end">
            {rightElement}
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
