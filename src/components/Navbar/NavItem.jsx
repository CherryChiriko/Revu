import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../slices/themeSlice";

const NavItem = ({ item, isMobile = false }) => {
  const activeTheme = useSelector(selectActiveTheme);
  const location = useLocation();
  const isActive = location.pathname === item.path;

  // 1. New Logic: The link is disabled if it's currently active OR if item.disabled is true.
  const isDisabled = item.disabled || isActive;

  // Base button styling
  const baseButtonClasses = `
    inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium
    transition-colors duration-200 no-underline
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-current
    ${activeTheme.ring.focus}
    disabled:pointer-events-none disabled:opacity-50
  `;

  // Size variants
  const sizeClasses = isMobile
    ? "h-10 px-4 py-2 text-base w-full justify-start"
    : "h-9 px-3";

  // Active / inactive variants (Uses gradient for active state)
  const variantClasses = isActive
    ? `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} ${activeTheme.text.activeButton} shadow-md`
    : `${activeTheme.text.primary} ${activeTheme.link.hoverText} ${activeTheme.link.hoverBg}`;

  // Combined classes for the component element
  const finalClasses = `${baseButtonClasses} ${sizeClasses} ${variantClasses} flex items-center gap-2 ${
    isDisabled
      ? // 2. Disabled Style: Keeps the appearance of the button but makes it inert and uses pointer cursor.
        "pointer-events-none !cursor-pointer"
      : "hover:scale-[1.02] active:scale-100"
  } transition-transform`;

  // 3. Conditional Element: Renders a div if disabled, Link if enabled.
  const Element = isDisabled ? "div" : Link;

  return (
    <Element
      {...(!isDisabled && { to: item.path })}
      className={finalClasses}
      role={isDisabled ? "button" : undefined}
      aria-disabled={isDisabled}
    >
      {React.cloneElement(item.icon, {
        className: `${item.icon.props.className || ""} w-4 h-4`,
      })}
      <span>{item.label}</span>
    </Element>
  );
};

export default NavItem;
