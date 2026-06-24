export const inputCls = (activeTheme) =>
  `w-full rounded-xl py-2.5 px-3.5 text-sm border outline-none focus:ring-2 transition-all
   ${activeTheme.background.canvas} ${activeTheme.text.primary}
   ${activeTheme.border.card} ${activeTheme.ring?.input ?? `focus:${activeTheme.ring.focus}`}`;

export const selectCls = (activeTheme) =>
  `${inputCls(activeTheme)} appearance-none pr-10`;
