import React from "react";

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
      <div className="space-y-1.5">
        <label
          className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
        >
          Front
        </label>
        <input
          type="text"
          value={editFront}
          onChange={(e) => setEditFront(e.target.value)}
          placeholder={isC ? "Chinese character(s)" : "Word or phrase"}
          className={inputCls}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <label
          className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
        >
          Back / Meaning
        </label>
        <textarea
          value={editBack}
          onChange={(e) => setEditBack(e.target.value)}
          placeholder="Meaning or translation"
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </div>

      {isC && (
        <div className="space-y-1.5">
          <label
            className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text.accent3}`}
          >
            Reading (Pinyin)
          </label>
          <input
            type="text"
            value={editReading}
            onChange={(e) => setEditReading(e.target.value)}
            placeholder="e.g. nǐ hǎo  (auto-generated if blank)"
            className={inputCls}
          />
          <p className={`text-[10px] ${activeTheme.text.muted}`}>
            Changing the character will regenerate tones and stroke colours
            automatically.
          </p>
        </div>
      )}
    </div>
  );
}
