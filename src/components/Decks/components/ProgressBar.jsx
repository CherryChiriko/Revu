// src/components/Study/components/Card/ProgressBar.jsx
import React from "react";
import { STATUS_COLOR } from "../../../utils/constants";
import { SegmentedBar } from "../../General/ui/SegmentedBar";

export const ProgressBar = ({
  counts = {},
  cards_count = 0,
  activeTheme,
  compact = false,
}) => {
  const { suspended = 0, waiting = 0, due = 0, new: newCards = 0 } = counts;

  const getStatusBackground = (status) => {
    const themeKey = STATUS_COLOR[status];
    return activeTheme?.background?.[themeKey] || activeTheme.background.canvas;
  };

  const segments = [
    {
      key: "due",
      label: "due",
      count: due,
      colorClass: getStatusBackground("due"),
    },
    {
      key: "waiting",
      label: "waiting",
      count: waiting,
      colorClass: getStatusBackground("waiting"),
    },
    {
      key: "new",
      label: "new",
      count: newCards,
      colorClass: getStatusBackground("new"),
    },
    {
      key: "suspended",
      label: "suspended",
      count: suspended,
      colorClass: getStatusBackground("suspended"),
    },
  ];

  return (
    <SegmentedBar
      segments={segments}
      total={cards_count}
      activeTheme={activeTheme}
      compact={compact}
    />
  );
};

export default ProgressBar;
