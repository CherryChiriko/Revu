import React from "react";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../../slices/themeSlice";

const Header = ({ title, description }) => {
  const activeTheme = useSelector(selectActiveTheme);

  return (
    <header className="mb-2">
      {" "}
      <h1
        className={`text-4xl font-extrabold ${activeTheme.text.primary} mb-3`}
      >
        {title}
      </h1>
      <p className={`${activeTheme.text.secondary} text-lg`}>{description}</p>
    </header>
  );
};

export default Header;
