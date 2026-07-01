import React from "react";

export function FormField({
  label,
  error,
  hint,
  required,
  activeTheme,
  children,
}) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      {label && (
        <p
          className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.muted}`}
        >
          {label}{" "}
          {required && <span className={activeTheme.text.danger}>*</span>}
        </p>
      )}

      {/* Renders the wrapped <input>, <textarea>, or <select> container natively */}
      {children}

      {error && (
        <p className="text-red-400 text-[11px] font-medium leading-tight mt-0.5">
          {error}
        </p>
      )}

      {hint && !error && (
        <p className={`text-[10px] leading-normal ${activeTheme.text.muted}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
