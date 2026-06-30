import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../slices/themeSlice";
import { selectUserProfile } from "../../slices/userSlice";
import { selectSettings } from "../../slices/settingsSlice";
import { AvatarDisplay } from "../General/ui/AvatarDisplay";
import RevuLogo from "../../assets/Revu_logo.png";
import navigationItems from "../../data/navigationItems";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import NavItem from "./NavItem";

const Navbar = () => {
  const activeTheme = useSelector(selectActiveTheme);
  const profile = useSelector(selectUserProfile);
  const settings = useSelector(selectSettings);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <>
      {/* ── Desktop ── */}
      <nav
        className={`hidden md:flex items-center justify-between p-4 border-b sticky top-0 z-50 w-full shadow-md
          ${activeTheme.background.navbar} backdrop-blur-sm ${activeTheme.border.muted}`}
      >
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 relative">
            <div className={`absolute inset-0 ${gradient}`} style={logoMask} />
          </div>
        </Link>

        <div className="flex items-center space-x-2 ml-auto">
          {navigationItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
          <Link
            to="/settings"
            title={username}
            className="ml-2 w-10 h-10 rounded-xl shadow-md ring-2 ring-white/10 hover:scale-[1.03] transition-transform overflow-hidden flex-shrink-0"
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
        className={`md:hidden flex items-center justify-between p-4 border-b sticky top-0 z-50 w-full
          ${activeTheme.background.navbar} backdrop-blur-sm ${activeTheme.border.muted}`}
      >
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 relative">
            <div className={`absolute inset-0 ${gradient}`} style={logoMask} />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/settings"
            title={username}
            className="w-9 h-9 rounded-xl shadow-md overflow-hidden flex-shrink-0"
          >
            <AvatarDisplay
              settings={settings}
              username={username}
              className="w-full h-full text-sm"
            />
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
      </div>

      {/* ── Mobile dropdown ── */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className={`md:hidden flex flex-col p-4 space-y-2 border-b shadow-md
            ${activeTheme.background.navbar} ${activeTheme.text.primary} ${activeTheme.border.muted}`}
        >
          {navigationItems.map((item) => (
            <NavItem key={item.id} item={item} isMobile />
          ))}
        </div>
      )}
    </>
  );
};

export default Navbar;
