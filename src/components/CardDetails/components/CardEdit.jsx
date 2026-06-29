import React from "react";
import { FormField } from "../../General/ui/FormField";

export function CardEdit({
  editFront,
  setEditFront,
  editBack,
  setEditBack,
  editReading,
  setEditReading,
  isC,
  activeTheme,
  inputCls,
}) {
  return (
    <div className="space-y-5">
      <FormField label="Front" activeTheme={activeTheme}>
        <input
          type="text"
          value={editFront}
          onChange={(e) => setEditFront(e.target.value)}
          placeholder={isC ? "Chinese character(s)" : "Word or phrase"}
          className={inputCls}
          autoFocus
        />
      </FormField>

      <FormField label="Back / Meaning" activeTheme={activeTheme}>
        <textarea
          value={editBack}
          onChange={(e) => setEditBack(e.target.value)}
          placeholder="Meaning or translation"
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </FormField>

      {isC && (
        <FormField
          label="Reading (Pinyin)"
          hint="Changing the character will regenerate tones and stroke colours automatically."
          activeTheme={activeTheme}
        >
          <input
            type="text"
            value={editReading}
            onChange={(e) => setEditReading(e.target.value)}
            placeholder="e.g. nǐ hǎo  (auto-generated if blank)"
            className={inputCls}
          />
        </FormField>
      )}
    </div>
  );
}
