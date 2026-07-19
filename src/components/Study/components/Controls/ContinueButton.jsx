// src/components/Study/components/Controls/ContinueButton.jsx
const ContinueButton = ({ onContinue, activeTheme }) => (
  <button
    onClick={onContinue}
    className={`px-5 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full font-semibold ${activeTheme.button.primary} ${activeTheme.text.activeButton} transition-all duration-300 shadow-md hover:shadow-xl active:scale-95`}
  >
    Continue
  </button>
);

export default ContinueButton;
