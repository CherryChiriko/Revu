import { useState } from "react";

export function useSettingSave(saveFunction) {
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  const handleSave = async (...args) => {
    setSaveState("saving");
    try {
      await saveFunction(...args);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch (err) {
      console.error("Settings save execution error:", err);
      setSaveState("error");
    }
  };

  const saveLabel = {
    idle: "Save changes",
    saving: "Saving…",
    saved: "Saved",
    error: "Try again",
  }[saveState];

  return { handleSave, saveState, saveLabel };
}
