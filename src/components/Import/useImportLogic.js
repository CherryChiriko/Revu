import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { generateMetadata } from "../../utils/generateMetadata";

import { useNavigate } from "react-router-dom";

export const useImportLogic = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [columnMappings, setColumnMappings] = useState({
    word: "",
    meaning: "",
    reading: "",
    audioUrl: "",
  });

  const [deckSettings, setDeckSettings] = useState({
    name: "",
    description: "",
    language: "japanese",
    tags: "",
  });

  const handleImport = async () => {
    setIsProcessing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. Create Deck
      const { data: deck, error: deckErr } = await supabase
        .from("decks")
        .insert([
          {
            name: deckSettings.name,
            description: deckSettings.description,
            language: deckSettings.language,
            study_mode: deckSettings.language === "chinese" ? "C" : "A",
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (deckErr) throw deckErr;

      // 2. Prepare Cards
      const table = deck.study_mode === "C" ? "cards_c" : "cards_a";
      const cardsToInsert = fileContent.map((row) => {
        const frontText = row[columnMappings.word];
        const meta = generateMetadata(frontText, deckSettings.language);
        const baseCard = {
          deck_id: deck.id,
          front: frontText,
          back: row[columnMappings.meaning],
          audioUrl: row[columnMappings.audioUrl] || null,
        };

        return deck.study_mode === "C"
          ? {
              ...baseCard,
              reading: meta.reading,
              tones: meta.tones,
              strokeColors: meta.strokeColors,
            }
          : {
              ...baseCard,
              reading: row[columnMappings.reading] || meta.reading,
            };
      });

      // 3. Batch Insert & Progress Initialization
      const { data: newCards, error: cardErr } = await supabase
        .from(table)
        .insert(cardsToInsert)
        .select();
      if (cardErr) throw cardErr;

      const progressTable =
        deck.study_mode === "C" ? "card_c_progress" : "card_a_progress";
      const progressEntries = newCards.map((card) => ({
        card_id: card.id,
        user_id: user.id,
        deck_id: deck.id,
        status: "new",
      }));

      await supabase.from(progressTable).insert(progressEntries);
      navigate("/decks");
    } catch (error) {
      console.error("Import Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    selectedFile,
    setSelectedFile,
    selectedType,
    setSelectedType,
    fileContent,
    setFileContent,
    columnMappings,
    setColumnMappings,
    deckSettings,
    setDeckSettings,
    isProcessing,
    handleImport,
  };
};
