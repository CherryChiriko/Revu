const themes = [
  {
    id: "dark",
    name: "Dark Theme",
    isDark: true,

    background: {
      app: "bg-gray-900",
      secondary: "bg-gray-800",
      track: "bg-gray-700",
      navbar: "bg-gray-800",
      canvas: "bg-gray-900",
      accent1: "bg-sky-500",
      accent2: "bg-purple-500",
      accent3: "bg-indigo-500",
    },

    text: {
      primary: "text-gray-50",
      secondary: "text-gray-300",
      muted: "text-gray-500",
      activeButton: "text-white",
      accent1: "text-sky-500",
      accent2: "text-purple-500",
      accent3: "text-indigo-500",
    },

    // New: Link/Navigation Item styling
    link: {
      hoverBg: "hover:bg-gray-700", // Background on hover
      hoverText: "hover:text-white", // Text color on hover
    },

    // New: Focus ring
    ring: {
      focus: "ring-indigo-500", // Focus ring color
    },

    // Components (Buttons, Borders, Gradients)
    button: {
      primary: "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800",
      secondary: "bg-gray-700 hover:bg-gray-600 active:bg-gray-700",
      disabled: "bg-gray-700 text-gray-500 cursor-not-allowed",
      accent:
        "bg-purple-500 hover:bg-purple-600 active:bg-purple-600 text-white",
      accent2: "bg-sky-500 hover:bg-sky-600 active:bg-sky-600 text-white",
    },
    border: {
      card: "border-gray-700",
      muted: "border-gray-700",
    },
    gradients: {
      from: "from-indigo-500",
      to: "to-purple-500",
      colors: [
        "#111827",
        "#0a2554",
        "#0c2f83",
        "#2e33b1",
        "#5d2edb",
        "#9400ff",
      ],
    },
  },
  {
    id: "light",
    name: "Light Theme",
    isDark: false,

    background: {
      app: "bg-gray-50",
      secondary: "bg-white",
      navbar: "bg-white/80",
      canvas: "bg-white",
      accent1: "bg-sky-500",
      accent2: "bg-purple-500",
      accent3: "bg-purple-500",
    },

    text: {
      primary: "text-gray-900",
      secondary: "text-gray-700",
      muted: "text-gray-500",
      activeButton: "text-white",
      accent1: "text-sky-500",
      accent2: "text-purple-500",
      accent3: "text-purple-500",
    },

    // New: Link/Navigation Item styling
    link: {
      hoverBg: "hover:bg-gray-200", // Background on hover
      hoverText: "hover:text-gray-900", // Text color on hover
    },

    // New: Focus ring
    ring: {
      focus: "ring-indigo-600", // Focus ring color
    },

    // Components (Buttons, Borders, Gradients)
    button: {
      primary: "bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700",
      secondary:
        "bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800",
      accent:
        "bg-purple-200 hover:bg-purple-300 active:bg-purple-400 text-purple-800",
      disabled: "bg-gray-100 text-gray-400 cursor-not-allowed",
      accent2: "bg-sky-500 hover:bg-sky-600 active:bg-sky-600 text-white",
    },
    border: {
      card: "border-gray-200",
      muted: "border-gray-700",
    },
    gradients: {
      from: "from-indigo-400",
      to: "to-blue-500",
      colors: [
        "#111827",
        "#1a2347",
        "#2d2d67",
        "#4b3284",
        "#71329d",
        "#9c27b0",
      ],
    },
  },
];

export default themes;
