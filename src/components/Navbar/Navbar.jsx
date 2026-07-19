// src/components/General/ui/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../slices/themeSlice";
import { selectUserProfile } from "../../slices/userSlice";
import { selectSettings } from "../../slices/settingsSlice";
import { AvatarDisplay } from "../General/ui/AvatarDisplay";
import RevuLogo from "../../assets/Revu_logo.png";
import navigationItems from "../../data/navigationItems";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import NavItem from "./NavItem";

const Navbar = () => {
  const activeTheme = useSelector(selectActiveTheme);
  const profile = useSelector(selectUserProfile);
  const settings = useSelector(selectSettings);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const gradient = `bg-gradient-to-r ${activeTheme.gradients.from} ${activeTheme.gradients.to}`;
  const username = profile?.username || "User";

  const logoMask = {
    WebkitMaskImage: `url(${RevuLogo})`,
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    WebkitMaskSize: "contain",
    maskImage: `url(${RevuLogo})`,
    maskRepeat: "no-repeat",
    maskPosition: "center",
    maskSize: "contain",
  };

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMenuOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* ── Desktop ── */}
      <nav
        className={`hidden md:flex items-center justify-between px-6 py-3 border-b sticky top-0 z-40 w-full shadow-sm
          ${activeTheme.background.navbar} backdrop-blur-md ${activeTheme.border.muted}`}
      >
        <Link to="/" className="flex items-center space-x-2 shrink-0">
          <div className="w-8 h-8 relative">
            <div className={`absolute inset-0 ${gradient}`} style={logoMask} />
          </div>
        </Link>

        <div className="flex items-center gap-1 ml-auto">
          {navigationItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
          <Link
            to="/settings"
            title={username}
            className={`ml-2 w-10 h-10 rounded-xl shadow-md ring-1 ${activeTheme.border.secondary} hover:scale-[1.03] transition-transform overflow-hidden flex-shrink-0`}
          >
            <AvatarDisplay
              settings={settings}
              username={username}
              className="w-full h-full text-sm"
            />
          </Link>
        </div>
      </nav>

      {/* ── Mobile header ── */}
      <div
        className={`md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40 w-full shadow-sm
          ${activeTheme.background.navbar} backdrop-blur-md ${activeTheme.border.muted}`}
      >
        <Link to="/" className="flex items-center space-x-2 shrink-0">
          <div className="w-8 h-8 relative">
            <div className={`absolute inset-0 ${gradient}`} style={logoMask} />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/settings"
            title={username}
            className={`w-9 h-9 rounded-xl shadow-md ring-1 ${activeTheme.border.secondary} overflow-hidden flex-shrink-0`}
          >
            <AvatarDisplay
              settings={settings}
              username={username}
              className="w-full h-full text-sm"
            />
          </Link>
          <button
            className={`${activeTheme.text.primary} p-1 rounded-lg transition-colors duration-200`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <FontAwesomeIcon
              icon={isMenuOpen ? faXmark : faBars}
              className="h-6 w-6"
            />
          </button>
        </div>
      </div>

      {/* ── Mobile overlay menu ── */}
      {isMenuOpen && (
        <>
          {/* Backdrop scrim */}
          <div
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div
            ref={menuRef}
            id="mobile-menu"
            className={`md:hidden fixed top-[57px] left-0 right-0 bottom-0 z-50 flex flex-col p-4 gap-1 overflow-y-auto
              ${activeTheme.background.app} ${activeTheme.text.primary} border-t ${activeTheme.border.muted}`}
          >
            {navigationItems.map((item) => (
              <NavItem key={item.id} item={item} isMobile />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
