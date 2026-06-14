const themes = [
  {
    id: "dark",
    name: "Dark Theme",
    isDark: true,

    background: {
      app: "bg-gray-900",
      secondary: "bg-gray-800",
      card: "bg-gray-800",
      light: "bg-gray-400",
      track: "bg-gray-700",
      navbar: "bg-gray-800",
      canvas: "bg-gray-900",
      accent1: "bg-sky-500",
      accent2: "bg-purple-500",
      accent3: "bg-indigo-500",
      danger: "bg-[#2c0b0e]",
    },

    text: {
      primary: "text-gray-50",
      secondary: "text-gray-300",
      muted: "text-gray-500",
      activeButton: "text-white",
      danger: "text-red-300",
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
      danger: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white",
    },
    border: {
      card: "border-gray-300",
      muted: "border-gray-700",
      secondary: "border-gray-600",
      danger: "border-red-700",
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
      card: "bg-white",
      light: "bg-gray-200",
      navbar: "bg-white/80",
      canvas: "bg-gray-200",
      track: "bg-gray-300",
      accent1: "bg-sky-400",
      accent2: "bg-purple-400",
      accent3: "bg-indigo-400",
      danger: "bg-red-50",
      muted: "bg-gray-100",
    },

    text: {
      primary: "text-gray-900",
      secondary: "text-gray-700",
      muted: "text-gray-500",
      activeButton: "text-white",
      danger: "text-red-600",
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
      primary: "bg-indigo-400 hover:bg-indigo-500 active:bg-indigo-600",
      secondary:
        "bg-gray-100 hover:bg-gray-300 active:bg-gray-400 text-gray-800",
      accent:
        "bg-purple-400 hover:bg-purple-500 active:bg-purple-600 text-purple-800",
      disabled: "bg-gray-100 text-gray-400 cursor-not-allowed",
      accent2: "bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white",
      danger: "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white",
    },
    border: {
      card: "border-gray-700",
      muted: "border-gray-100",
      secondary: "border-gray-300",
      danger: "border-red-300",
    },
    gradients: {
      from: "from-indigo-400",
      to: "to-purple-400",

      // colors: [
      //   "#FFDBFD",
      //   "#efbff9",
      //   "#daa4f8",
      //   "#be8df9",
      //   "#9878fc",
      //   "#8084FF",
      // ],
      colors: [
        "#D2A7FB",
        "#c6a2fa",
        "#ba9df9",
        "#ac98f8",
        "#9e94f7",
        "#8E90F5",
      ],
    },
  },
];

export default themes;
