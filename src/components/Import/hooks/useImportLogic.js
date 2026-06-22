import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { generateReading } from "./generateReading";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchDecks, selectDecks } from "../../../slices/deckSlice";

export const useImportLogic = () => {
  const dispatch = useDispatch();
  const allDecks = useSelector(selectDecks);

  const [importMode, setImportMode] = useState("new");
  const [targetDeckId, setTargetDeckId] = useState("");

  const targetDeck =
    allDecks.find((d) => String(d.deck_id) === String(targetDeckId)) ?? null;

  const existingStudyType = targetDeck?.study_mode === "C" ? 2 : 1;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStudyType, setSelectedStudyType] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [fileContent, setFileContent] = useState([]);
  const [mappedColumns, setMappedColumns] = useState({});
  const [deckSettings, setDeckSettings] = useState({
    name: "",
    description: null,
    language: null,
    tags: null,
  });
  const [existingLanguages, setExistingLanguages] = useState([]);
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("decks")
        .select("language")
        .eq("user_id", user.id);
      const unique = [...new Set(data?.map((d) => d.language))].filter(Boolean);
      setExistingLanguages(unique);
    };
    fetchLanguages();
  }, []);

  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadError(null);
      processFile(file);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const downloadTemplate = () => {
    const type =
      importMode === "existing" ? existingStudyType : selectedStudyType;
    const map = {
      1: {
        fileName: "template_standard.xlsx",
        filePath: "/templates/template_standard.xlsx",
      },
      2: {
        fileName: "template_chinese.xlsx",
        filePath: "/templates/template_chinese.xlsx",
      },
    };
    const { fileName, filePath } = map[type] ?? {};
    if (!filePath) return;
    const link = document.createElement("a");
    link.href = filePath;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [hasHeaders, setHasHeaders] = useState(true);

  useEffect(() => {
    if (!selectedFile) return;
    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (ext === "csv") parseCSV(selectedFile);
    else if (["xlsx", "xls"].includes(ext)) parseExcel(selectedFile);
  }, [selectedFile, hasHeaders]);

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: hasHeaders,
      skipEmptyLines: true,
      encoding: "UTF-8",
      delimiter: "",
      delimitersToGuess: [",", ";", "\t", "|"],
      complete: (results) => {
        if (!hasHeaders) {
          const normalized = results.data.map((row) =>
            Object.fromEntries(
              Object.entries(row).filter(([_, v]) => v !== "" && v != null),
            ),
          );
          setFileContent(normalized);
        } else {
          setFileContent(results.data);
        }
      },
      error: (err) => setUploadError("Error parsing CSV: " + err.message),
    });
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          blankrows: false,
          defval: "",
        });
        if (!rows.length) {
          setUploadError("Excel file is empty.");
          return;
        }
        let normalized;
        if (hasHeaders) {
          const headers = rows[0];
          normalized = rows.slice(1).map((row) =>
            row.reduce((acc, cell, i) => {
              if (cell !== "" && cell != null) acc[headers[i] || i] = cell;
              return acc;
            }, {}),
          );
        } else {
          normalized = rows.map((row) =>
            row.reduce((acc, cell, i) => {
              if (cell !== "" && cell != null) acc[i] = cell;
              return acc;
            }, {}),
          );
        }
        setFileContent(normalized);
      } catch (err) {
        console.error(err);
        setUploadError("Error parsing Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const getFileExtension = (file) => {
    const validMime = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const ext = file.name.split(".").pop().toLowerCase();
    if (
      !validMime.includes(file.type) &&
      !["csv", "xlsx", "xls"].includes(ext)
    ) {
      setUploadError("Invalid File Type. Please upload a CSV or Excel file.");
      return null;
    }
    return ext;
  };

  const processFile = (file) => {
    const ext = getFileExtension(file);
    if (!ext) return;
    setSelectedFile(file);
    ext === "csv" ? parseCSV(file) : parseExcel(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const getFields = () => {
    const type =
      importMode === "existing" ? existingStudyType : selectedStudyType;
    switch (type) {
      case 1:
        return [
          { key: "front", label: "Front (Word)", required: true },
          { key: "back", label: "Back (Meaning)", required: true },
          { key: "audioUrl", label: "Audio URL", required: false },
        ];
      case 2:
        return [
          { key: "front", label: "Character", required: true },
          { key: "back", label: "Meaning", required: true },
          { key: "reading", label: "Reading (Pinyin/Kana)", required: false },
          { key: "audioUrl", label: "Audio URL", required: false },
        ];
      default:
        return [];
    }
  };

  const handleSwap = () =>
    setMappedColumns({
      ...mappedColumns,
      front: mappedColumns.back,
      back: mappedColumns.front,
    });

  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isNameTaken, setIsNameTaken] = useState(false);

  const checkDeckNameExists = async () => {
    const name = deckSettings.name?.trim();
    if (!name) {
      setIsNameTaken(false);
      return false;
    }
    setIsCheckingName(true);
    setUploadError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("decks")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", name)
      .maybeSingle();
    setIsCheckingName(false);
    if (error) {
      console.error(error);
      return false;
    }
    if (data) {
      setIsNameTaken(true);
      setUploadError("Deck name already in use.");
      return true;
    }
    setIsNameTaken(false);
    return false;
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({
    current: 0,
    total: 0,
  });

  const getStudyMode = () => {
    if (importMode === "existing") return targetDeck?.study_mode ?? "A";
    return selectedStudyType === 2 ? "C" : "A";
  };

  const prepareCardsForInsert = (row) => {
    const type =
      importMode === "existing" ? existingStudyType : selectedStudyType;
    switch (type) {
      case 1:
        return {
          front: row[mappedColumns.front],
          back: row[mappedColumns.back],
          audioUrl: row[mappedColumns.audioUrl] || null,
          created_at: new Date(),
        };
      case 2: {
        const card = {
          front: row[mappedColumns.front],
          back: row[mappedColumns.back],
          audioUrl: row[mappedColumns.audioUrl] || null,
          reading: row[mappedColumns.reading] || null,
          created_at: new Date(),
        };
        const { reading, strokeColors, tones } = generateReading(
          card.front,
          "Chinese",
          card.reading,
        );
        return { ...card, reading, strokeColors, tones };
      }
      default:
        return {};
    }
  };

  const allCards = useMemo(() => {
    if (!mappedColumns.front || !mappedColumns.back || fileContent.length === 0)
      return [];
    return fileContent
      .map((row) => prepareCardsForInsert(row))
      .filter((c) => c.front?.trim() && c.back?.trim());
  }, [fileContent, mappedColumns, selectedStudyType, importMode, targetDeckId]);

  const uploadCards = async (deckId, targetTable) => {
    const cardsWithDeck = allCards.map((c) => ({ ...c, deck_id: deckId }));
    const CHUNK_SIZE = 400;
    const total = cardsWithDeck.length;
    const progressTable = targetTable.replace("cards_", "card_") + "_progress";

    setProcessingProgress({ current: 0, total });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User session not found.");

    for (let i = 0; i < total; i += CHUNK_SIZE) {
      const chunk = cardsWithDeck.slice(i, i + CHUNK_SIZE);

      let insertedCards = [];
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data, error } = await supabase
          .from(targetTable)
          .insert(chunk)
          .select("id");
        if (!error) {
          insertedCards = data;
          break;
        }
        if (attempt === 3)
          throw new Error("Server unresponsive. Card insert aborted.");
        await new Promise((r) => setTimeout(r, attempt * 2000));
      }

      const progressChunk = insertedCards.map((c) => ({
        user_id: user.id,
        card_id: c.id,
        deck_id: deckId,
        status: "new",
        ease_factor: 2.5,
        review_interval: 0,
        repetitions: 0,
        suspended: false,
        due_date: null,
        last_studied: null,
      }));

      for (let attempt = 1; attempt <= 3; attempt++) {
        const { error } = await supabase
          .from(progressTable)
          .insert(progressChunk);
        if (!error) break;
        if (attempt === 3)
          throw new Error("Card data written but progress insert failed.");
        await new Promise((r) => setTimeout(r, attempt * 2000));
      }

      setProcessingProgress({
        current: Math.min(i + CHUNK_SIZE, total),
        total,
      });
      await new Promise((r) => setTimeout(r, 50));
    }
  };

  const createDeck = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setUploadError(null);

    const study_mode = getStudyMode();
    const targetTable = "cards_" + study_mode.toLowerCase();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const language = deckSettings.language?.trim().toLowerCase() ?? "";
      const formattedLanguage =
        language.charAt(0).toUpperCase() + language.slice(1);

      const { data: newDeck, error: deckError } = await supabase
        .from("decks")
        .insert([
          {
            user_id: user.id,
            name: deckSettings.name,
            description: deckSettings.description || null,
            language: formattedLanguage,
            study_mode,
            tags: deckSettings.tags
              ? deckSettings.tags.split(",").map((t) => t.trim())
              : [],
            cards_count: allCards.length,
            mastered_count: 0,
            waiting_count: 0,
            due_count: 0,
            new_count: allCards.length,
            suspended_count: 0,
            active_cards_count: allCards.length,
            last_reviewed: null,
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (deckError) throw deckError;

      try {
        await uploadCards(newDeck.id, targetTable);
      } catch (uploadErr) {
        await supabase.from("decks").delete().eq("id", newDeck.id);
        throw uploadErr;
      }

      await dispatch(fetchDecks()).unwrap();
    } catch (err) {
      console.error("Import failed:", err);
      setUploadError(err.message || "Error during upload.");
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadToExisting = async () => {
    if (isProcessing || !targetDeckId) return;
    setIsProcessing(true);
    setUploadError(null);

    const study_mode = targetDeck?.study_mode ?? "A";
    const targetTable = "cards_" + study_mode.toLowerCase();

    try {
      await uploadCards(targetDeckId, targetTable);
      await dispatch(fetchDecks()).unwrap();
    } catch (err) {
      console.error("Upload to existing failed:", err);
      setUploadError(err.message || "Error during upload.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    importMode,
    setImportMode,
    targetDeckId,
    setTargetDeckId,
    targetDeck,
    allDecks,
    currentStep,
    setCurrentStep,
    selectedStudyType,
    setSelectedStudyType,
    selectedFile,
    fileContent,
    uploadError,
    isDragging,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileUpload,
    hasHeaders,
    setHasHeaders,
    downloadTemplate,
    getFields,
    handleSwap,
    mappedColumns,
    setMappedColumns,
    deckSettings,
    setDeckSettings,
    existingLanguages,
    isAddingLanguage,
    setIsAddingLanguage,
    isCheckingName,
    isNameTaken,
    checkDeckNameExists,
    isProcessing,
    processingProgress,
    allCards,
    createDeck,
    uploadToExisting,
  };
};
