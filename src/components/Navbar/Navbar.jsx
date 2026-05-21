import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../slices/themeSlice";

import RevuLogo from "../../assets/Revu_logo.png"; // This should be a transparent PNG or SVG
import navigationItems from "../../data/navigationItems";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import NavItem from "./NavItem";

const Navbar = () => {
  const activeTheme = useSelector(selectActiveTheme);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const gradient = `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to}`;

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={`hidden md:flex items-center justify-between p-4 border-b 
            ${activeTheme.background.navbar} backdrop-blur-sm 
            sticky top-0 z-50 w-full
            border-b ${activeTheme.border.muted} shadow-md`}
      >
        {/* Logo with gradient mask */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 relative">
            <div
              className={`absolute inset-0 ${gradient}`}
              style={{
                WebkitMaskImage: `url(${RevuLogo})`,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: "contain",
                maskImage: `url(${RevuLogo})`,
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "contain",
              }}
            />
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <div className="flex items-center space-x-2 ml-auto">
          {navigationItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>
      </nav>

      {/* Mobile Navbar */}
      <div
        className={`md:hidden flex items-center justify-between p-4 border-b 
            ${activeTheme.background.navbar} backdrop-blur-sm 
            sticky top-0 z-50 w-full 
            border-b ${activeTheme.border.muted}`}
      >
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 relative">
            <div
              className={`absolute inset-0 ${gradient}`}
              style={{
                WebkitMaskImage: `url(${RevuLogo})`,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: "contain",
                maskImage: `url(${RevuLogo})`,
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "contain",
              }}
            />
          </div>
        </Link>

        <button
          className={`${activeTheme.text.primary} transition-colors duration-200`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className={`md:hidden flex flex-col p-4 space-y-2 
            ${activeTheme.background.navbar} ${activeTheme.text.primary} 
            border-b ${activeTheme.border.muted} shadow-md`}
        >
          {navigationItems.map((item) => (
            // Assuming NavItem handles the mobile styles like full width links
            <NavItem key={item.id} item={item} isMobile />
          ))}
        </div>
      )}
    </>
  );
};

export default Navbar;
