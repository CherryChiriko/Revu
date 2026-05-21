import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function SessionComplete({
  isOpen,
  learnedCount,
  onGoBack,
  onLearnMore,
  activeTheme,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`${activeTheme.background.secondary} rounded-3xl p-8 px-10 shadow-2xl text-center max-w-sm`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 14 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="text-5xl mb-4"
            >
              🎉
            </motion.div>

            <h1
              className={`${activeTheme.text.primary} text-2xl font-semibold mb-2`}
            >
              Session Complete!
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`${activeTheme.text.secondary} text-lg`}
            >
              You learned <span className="font-bold">{learnedCount}</span> word
              {learnedCount > 1 ? "s" : ""} today.
            </motion.p>

            <div className="flex flex-col gap-4">
              <motion.button
                onClick={onLearnMore}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className={`py-2 rounded-lg ${activeTheme.button.accent} transition`}
              >
                Learn More
              </motion.button>

              <motion.button
                onClick={onGoBack}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className={`flex items-center ${activeTheme.text.muted} hover:${activeTheme.text.primary} transition-colors duration-200`}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5 mr-2" />
                Go back
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
