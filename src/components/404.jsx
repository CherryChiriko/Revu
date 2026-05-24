import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const NotFound404 = ({ activeTheme }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center text-center p-6 ${activeTheme.background.app}`}
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`text-7xl font-extrabold mb-3 ${activeTheme.text.primary}`}
      >
        404
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className={`text-xl mb-6 ${activeTheme?.text?.secondary}`}
      >
        Oops — looks like you flipped to a card that doesn’t exist.
      </motion.p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        onClick={() => navigate("/")}
        className={`flex items-center gap-2 ${activeTheme.button.accent2} px-5 py-2 rounded-2xl hover:shadow-lg transition`}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5 mr-2" />
        Return to Home
      </motion.button>
    </div>
  );
};

export default NotFound404;
