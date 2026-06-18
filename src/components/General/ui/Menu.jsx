import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";

const MenuContext = createContext(null);
function useMenuContext() {
  const context = useContext(MenuContext);
  if (context === null) {
    throw new Error(
      "Menu sub-components (Trigger, Items, Item) must be rendered inside a <Menu> component.",
    );
  }
  return context;
}

export default function Menu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <MenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left" ref={menuRef}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

// 1. Trigger Component
Menu.Trigger = function MenuTrigger({ children }) {
  const { isOpen, setIsOpen } = useMenuContext(); // <-- Updated
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen((o) => !o);
      }}
      className="cursor-pointer inline-block"
    >
      {typeof children === "function" ? children(isOpen) : children}
    </div>
  );
};

Menu.Items = function MenuItems({ children, activeTheme, width = "w-40" }) {
  const { isOpen } = useMenuContext(); // <-- Updated
  if (!isOpen) return null;

  return (
    <div
      className={`absolute right-0 mt-2 ${width}
        rounded-xl shadow-xl border overflow-hidden
        
        origin-top-right z-[100] p-1.5 flex flex-col gap-0.5
        ${activeTheme.background.secondary}
        ${activeTheme.border.secondary}`}
    >
      {children}
    </div>
  );
};

Menu.Item = function MenuItem({
  children,
  action,
  danger,
  activeTheme,
  divider,
}) {
  const { setIsOpen } = useMenuContext();

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(false);
          action?.();
        }}
        className={`w-full flex items-center gap-3 text-left
          px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
          ${
            danger
              ? `${activeTheme.text.danger} hover:bg-red-500/10`
              : `${activeTheme.text.primary} ${activeTheme.link.hoverBg} ${activeTheme.link.hoverText}`
          }`}
      >
        {children}
      </button>
      {divider && (
        <hr
          className={`border-t my-1 opacity-60 ${activeTheme.border.muted}`}
        />
      )}
    </>
  );
};
