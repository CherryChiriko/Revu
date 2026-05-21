const ContinueButton = ({ onContinue, activeTheme }) => (
  <button
    onClick={onContinue}
    className={`px-6 py-3 rounded-full font-semibold ${activeTheme.button.primary} ${activeTheme.text.primary}
    transition-all duration-300 shadow-lg hover:shadow-xl`}
  >
    Continue
  </button>
);

export default ContinueButton;
