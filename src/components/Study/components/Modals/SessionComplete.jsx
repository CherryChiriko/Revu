import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function SessionComplete({
  isOpen,
  learnedCount,
  onGoBack,
  onLearnMore,
  activeTheme,
  isLoading = false,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`${activeTheme.background.secondary} rounded-3xl p-6 sm:p-8 shadow-2xl text-center w-full max-w-sm border ${activeTheme.border.card}`}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="text-5xl mb-4 select-none"
            >
              🎉
            </motion.div>

            <h1
              className={`${activeTheme.text.primary} text-xl sm:text-2xl font-bold mb-2`}
            >
              Session Complete!
            </h1>

            <p
              className={`${activeTheme.text.secondary} text-base sm:text-lg mb-6`}
            >
              You learned <span className="font-bold">{learnedCount}</span> word
              {learnedCount > 1 ? "s" : ""} today.
            </p>

            <div className="flex flex-col gap-3">
              <motion.button
                onClick={!isLoading ? onLearnMore : undefined}
                disabled={isLoading}
                whileTap={!isLoading ? { scale: 0.98 } : undefined}
                className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all
                  ${isLoading ? "opacity-70 cursor-wait" : "hover:brightness-110"}
                  ${activeTheme.button.accent} ${activeTheme.text.activeButton}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin w-4 h-4"
                    />
                    Loading cards...
                  </span>
                ) : (
                  "Learn More"
                )}
              </motion.button>

              <button
                onClick={onGoBack}
                className={`flex items-center justify-center py-3 px-4 rounded-xl text-sm font-medium transition-colors
                  ${activeTheme.text.muted} hover:${activeTheme.text.primary}`}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                Go back
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
