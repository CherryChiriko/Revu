import React from "react";
import { useSelector } from "react-redux";
import { selectActiveTheme } from "../../../slices/themeSlice";

export const Head = ({ title, description }) => {
  const activeTheme = useSelector(selectActiveTheme);
  return (
    <header
      className={`${activeTheme.background.secondary} rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden relative`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500" />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <p className={`${activeTheme.text.accent1} font-semibold mb-2`}>
            Study analytics
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold">Activity</h1>
          <p className={`${activeTheme.text.secondary} mt-2 max-w-2xl`}>
            A consistency-first view of your SRS work: what you reviewed, what
            you learned, and where your decks are building momentum.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 min-w-[260px]">
          {/* <div className={`${activeTheme.background.canvas} rounded-xl p-3`}>
            <p className={`${activeTheme.text.secondary} text-xs`}>Today</p>
            <p className="font-black">
              {recentDays[recentDays.length - 1]?.cardsStudied || 0}
            </p>
          </div>
          <div className={`${activeTheme.background.canvas} rounded-xl p-3`}>
            <p className={`${activeTheme.text.secondary} text-xs`}>14 days</p>
            <p className="font-black">{consistencyScore}%</p>
          </div>
          <div className={`${activeTheme.background.canvas} rounded-xl p-3`}>
            <p className={`${activeTheme.text.secondary} text-xs`}>Due</p>
            <p className="font-black">{dueCards}</p>
          </div> */}
        </div>
      </div>
    </header>
  );
};
