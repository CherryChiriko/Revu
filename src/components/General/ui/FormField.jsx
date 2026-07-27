import React from "react";

export function FormField({
  label,
  error,
  hint,
  required,
  activeTheme,
  htmlFor,
  children,
}) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={htmlFor}
          className={`text-[10px] font-black uppercase tracking-widest ${
            activeTheme?.text?.muted || "text-gray-500"
          }`}
        >
          {label}{" "}
          {required && (
            <span className={activeTheme?.text?.danger || "text-red-500"}>
              *
            </span>
          )}
        </label>
      )}

      {children}

      {error && (
        <p className="text-red-400 text-[11px] font-medium leading-tight mt-0.5">
          {error}
        </p>
      )}

      {hint && !error && (
        <p
          className={`text-[10px] leading-normal ${
            activeTheme?.text?.muted || "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export const inputCls = (activeTheme) => {
  const bg = activeTheme?.background?.canvas || "bg-gray-900";
  const text = activeTheme?.text?.primary || "text-gray-50";
  const border = activeTheme?.border?.card || "border-gray-700";
  const focusRing =
    activeTheme?.ring?.input ??
    `focus:${activeTheme?.ring?.focus || "ring-indigo-500"}`;

  return `w-full rounded-xl py-2.5 px-3.5 text-sm border outline-none focus:ring-2 transition-all select-text ${bg} ${text} ${border} ${focusRing}`;
};

export const selectCls = (activeTheme) =>
  `${inputCls(activeTheme)} appearance-none pr-10`;
