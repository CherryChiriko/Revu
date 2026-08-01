import React from "react";

/**
 * A highly versatile, standardized page header with a dynamic theme-based top accent bar.
 */
export default function Header({
  title,
  description,
  activeTheme,
  leftElement,
  rightElement,
  children,
}) {
  const gradientFrom = activeTheme?.gradients?.from || "from-indigo-500";
  const gradientTo = activeTheme?.gradients?.to || "to-purple-500";

  return (
    <header
      className={`${activeTheme.background.secondary} ${activeTheme.text.primary} rounded-2xl px-4 pt-3 pb-1 md:p-6 shadow-md overflow-hidden relative w-full`}
    >
      {/* Top accent strip */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 relative z-10 w-full">
        {/* Left side */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          {leftElement && <div className="flex-shrink-0">{leftElement}</div>}

          <div className="min-w-0">
            <p className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight">
              {title}
            </p>
            {description && (
              <p
                className={`${activeTheme.text.secondary} text-xs md:text-sm mt-1 leading-relaxed`}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right side */}
        {(rightElement || children) && (
          <div className="flex flex-wrap items-center gap-2 md:gap-4 flex-shrink-0 w-full md:w-auto justify-start md:justify-end">
            {rightElement}
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
