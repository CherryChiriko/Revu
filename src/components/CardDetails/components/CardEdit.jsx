import React from "react";
import { FormField } from "../../General/ui/FormField";
import { hasCJKCharacter } from "../../../utils/cjkValidation";

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
  const baseInputCls = inputCls(activeTheme);

  return (
    <div className="space-y-4 md:space-y-5">
      <FormField label="Front" activeTheme={activeTheme}>
        <input
          type="text"
          value={editFront}
          onChange={(e) => setEditFront(e.target.value)}
          placeholder={isC ? "Chinese character(s)" : "Word or phrase"}
          className={`${baseInputCls} resize-none text-base md:text-sm`}
          autoFocus
          autoComplete="off"
          enterKeyHint="next"
        />
        {isC && editFront.trim() !== "" && !hasCJKCharacter(editFront) && (
          <p className={`text-xs ${activeTheme.text.danger} mt-1`}>
            Front must contain at least one Chinese character.
          </p>
        )}
      </FormField>

      <FormField label="Back / Meaning" activeTheme={activeTheme}>
        <textarea
          value={editBack}
          onChange={(e) => setEditBack(e.target.value)}
          placeholder="Meaning or translation"
          rows={3}
          className={`${baseInputCls} resize-none text-base md:text-sm`}
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
            className={`${baseInputCls} resize-none text-base md:text-sm`}
            autoComplete="off"
            enterKeyHint="done"
          />
        </FormField>
      )}
    </div>
  );
}
