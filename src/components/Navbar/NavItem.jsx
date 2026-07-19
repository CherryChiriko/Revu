// src/components/General/ui/NavItem.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../slices/themeSlice";

const NavItem = ({ item, isMobile = false }) => {
  const activeTheme = useSelector(selectActiveTheme);
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const isDisabled = item.disabled || isActive;

  const baseClasses = `
    inline-flex items-center whitespace-nowrap rounded-lg text-sm font-medium
    transition-all duration-200 no-underline select-none
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
    ${activeTheme.ring.focus}
  `;

  const sizeClasses = isMobile
    ? "h-12 px-4 text-base w-full justify-start gap-3"
    : "h-9 px-3 justify-center gap-2";

  const stateClasses = isActive
    ? `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to} ${activeTheme.text.activeButton} shadow-md`
    : `${activeTheme.text.primary} ${activeTheme.link.hoverText} ${activeTheme.link.hoverBg}`;

  const interactionClasses = isDisabled
    ? "pointer-events-none"
    : "hover:scale-[1.02] active:scale-100 cursor-pointer";

  const finalClasses = `${baseClasses} ${sizeClasses} ${stateClasses} ${interactionClasses}`;

  // Disabled current-page items render as divs; everything else is a Link
  const Element = isDisabled ? "div" : Link;
  const elementProps = isDisabled
    ? { className: finalClasses, "aria-current": "page" }
    : { to: item.path, className: finalClasses };

  return (
    <Element {...elementProps}>
      {React.cloneElement(item.icon, {
        className: `${item.icon.props.className || ""} w-5 h-5`,
      })}
      <span>{item.label}</span>
    </Element>
  );
};

export default NavItem;
