import { useState } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "../../../utils/supabaseClient";
import { fetchDecks } from "../../../slices/deckSlice";

export function useCreateNew(onCreated) {
  const dispatch = useDispatch();

  // Form State
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("");
  const [studyMode, setStudyMode] = useState("A");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  // Status State
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Derived Validation
  const isValid = name.trim() !== "" && language.trim() !== "";

  const handleCreate = async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("Not authenticated.");

      const lang = language.trim();
      const formattedLang =
        lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();

      const { data: newDeck, error: deckErr } = await supabase
        .from("decks")
        .insert([
          {
            user_id: user.id,
            name: name.trim(),
            language: formattedLang,
            study_mode: studyMode,
            description: description.trim() || null,
            tags: tags
              ? tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [],
            cards_count: 0,
            new_count: 0,
            due_count: 0,
            waiting_count: 0,
            mastered_count: 0,
            suspended_count: 0,
            active_cards_count: 0,
            status: "learning",
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (deckErr) throw deckErr;

      await dispatch(fetchDecks()).unwrap();
      onCreated(newDeck.id);
    } catch (err) {
      console.error("Failed to create deck:", err);
      setError(err.message ?? "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    name,
    setName,
    language,
    setLanguage,
    studyMode,
    setStudyMode,
    description,
    setDescription,
    tags,
    setTags,
    isSaving,
    error,
    isValid,
    handleCreate,
  };
}
