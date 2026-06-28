export const STATUS_FILTERS = [
  "new",
  "waiting",
  "due",
  "mastered",
  "suspended",
];

export const STATUS_TILE = {
  new: { dot: "bg-gray-400", text: "text-gray-400", label: "new" },
  waiting: { dot: "bg-sky-400", text: "text-sky-400", label: "waiting" },
  due: { dot: "bg-purple-400", text: "text-purple-400", label: "due" },
  mastered: {
    dot: "bg-indigo-400",
    text: "text-indigo-400",
    label: "mastered",
  },
  suspended: { dot: "bg-red-400", text: "text-red-400", label: "suspended" },
};
