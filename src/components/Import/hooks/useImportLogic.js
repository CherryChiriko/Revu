import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { generateReading } from "./generateReading";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useDispatch } from "react-redux";
import { fetchDecks } from "../../../slices/deckSlice";

export const useImportLogic = () => {
  const dispatch = useDispatch(); // 👈 Initialize dispatch

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(1);
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

  //  -------------- Drag and drop  -------------- //
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

  //  -------------- Interpret file -------------- //
  const downloadTemplate = () => {
    let fileName = "";
    let filePath = "";

    switch (selectedType) {
      case 1:
        fileName = "template_standard.xlsx";
        filePath = "/templates/template_standard.xlsx";
        break;
      case 2:
        fileName = "template_chinese.xlsx";
        filePath = "/templates/template_chinese.xlsx";
        break;
      default:
        console.warn("No template available for this type.");
        return;
    }

    const link = document.createElement("a");
    link.href = filePath;
    link.setAttribute("download", fileName);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //  -------------- File parsing  -------------- //
  const [hasHeaders, setHasHeaders] = useState(true);

  useEffect(() => {
    if (!selectedFile) return;

    const fileExt = selectedFile.name.split(".").pop().toLowerCase();

    if (fileExt === "csv") {
      parseCSV(selectedFile);
    } else if (["xlsx", "xls"].includes(fileExt)) {
      parseExcel(selectedFile);
    }
  }, [selectedFile, hasHeaders]);

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: hasHeaders,
      skipEmptyLines: true,
      encoding: "UTF-8",
      delimiter: "",
      delimitersToGuess: [",", ";", "\t", "|"],
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn("PapaParse Errors:", results.errors);
        }

        if (!hasHeaders) {
          const normalized = results.data.map((row) => {
            return Object.fromEntries(
              Object.entries(row).filter(
                ([_, value]) =>
                  value !== "" && value !== null && value !== undefined,
              ),
            );
          });
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
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

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
            row.reduce((acc, cell, index) => {
              if (cell !== "" && cell !== null && cell !== undefined) {
                const key = headers[index] || index;
                acc[key] = cell;
              }
              return acc;
            }, {}),
          );
        } else {
          normalized = rows.map((row) =>
            row.reduce((acc, cell, index) => {
              if (cell !== "" && cell !== null && cell !== undefined) {
                acc[index] = cell;
              }
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
    const validMimeTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    const fileExtension = file.name.split(".").pop().toLowerCase();
    const validExtensions = ["csv", "xlsx", "xls"];

    const isValidType = validMimeTypes.includes(file.type);
    const isValidExtension = validExtensions.includes(fileExtension);

    if (!isValidType && !isValidExtension) {
      setUploadError("Invalid File Type. Please upload a CSV or Excel file.");
      return null;
    }

    return fileExtension;
  };

  const processFile = (file) => {
    const extension = getFileExtension(file);
    if (!extension) return;

    setSelectedFile(file);
    extension === "csv" ? parseCSV(file) : parseExcel(file);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
  };

  const getFields = () => {
    switch (selectedType) {
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

  const handleSwap = () => {
    setMappedColumns({
      ...mappedColumns,
      front: mappedColumns.back,
      back: mappedColumns.front,
    });
  };

  //  -------------- Check -------------- //
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
      setUploadError("Deck name already in use. Please choose another.");
      return true;
    }

    setIsNameTaken(false);
    return false;
  };

  //  -------------- Send out result -------------- //

  const [isProcessing, setIsProcessing] = useState(false);

  const [processingProgress, setProcessingProgress] = useState({
    current: 0,
    total: 0,
  });

  const getStudyMode = () => {
    switch (selectedType) {
      case 1:
        return "A";
      case 2:
        return "C";
      default:
        return "A";
    }
  };

  const prepareCardsForInsert = (row) => {
    switch (selectedType) {
      case 1:
        return {
          front: row[mappedColumns.front],
          back: row[mappedColumns.back],
          audioUrl: row[mappedColumns.audioUrl] || null,
          created_at: new Date(),
        };
      case 2:
        const card = {
          front: row[mappedColumns.front],
          back: row[mappedColumns.back],
          audioUrl: row[mappedColumns.audioUrl] || null,
          created_at: new Date(),
          reading: row[mappedColumns.reading] || null,
        };
        const { reading, strokeColors, tones } = generateReading(
          card.front,
          "Chinese",
          card.reading,
        );

        return {
          ...card,
          reading: reading,
          strokeColors: strokeColors,
          tones: tones,
        };
      default:
        return {};
    }
  };

  const allCards = useMemo(() => {
    if (
      !mappedColumns.front ||
      !mappedColumns.back ||
      fileContent.length === 0
    ) {
      return [];
    }

    return fileContent
      .map((row) => prepareCardsForInsert(row))
      .filter(
        (card) =>
          card.front &&
          card.back &&
          card.front.trim() !== "" &&
          card.back.trim() !== "",
      );
  }, [fileContent, mappedColumns, selectedType]);

  console.log("CARDS ", allCards.slice(0, 10));

  const uploadCards = async (deckId, targetTable) => {
    try {
      allCards.forEach((card) => {
        card.deck_id = deckId;
      });

      const CHUNK_SIZE = 400;
      const total = allCards.length;

      const progressTable =
        targetTable.replace("cards_", "card_") + "_progress";

      setProcessingProgress({ current: 0, total });

      // Get authenticated user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User session not found during card linking.");

      for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = allCards.slice(i, i + CHUNK_SIZE);

        let retryCount = 0;
        const maxRetries = 3;
        let success = false;
        let insertedCards = [];

        // --- STEP 1: INSERT CARD CONTENT ---
        while (!success && retryCount < maxRetries) {
          const { data, error } = await supabase
            .from(targetTable)
            .insert(chunk)
            .select("id");

          if (!error) {
            insertedCards = data;
            success = true;
          } else {
            retryCount++;
            console.warn(
              `Content chunk failed (attempt ${retryCount}). Retrying...`,
            );
            await new Promise((res) => setTimeout(res, retryCount * 2000));
          }
        }

        if (!success)
          throw new Error("Server is unresponsive. Card content save aborted.");

        const progressChunk = insertedCards.map((card) => ({
          user_id: user.id,
          card_id: card.id,
          deck_id: deckId,
          status: "new",
          ease_factor: 2.5,
          review_interval: 0,
          repetitions: 0,
          suspended: false,
          due_date: null,
          last_studied: null,
        }));

        retryCount = 0;
        success = false;

        // --- STEP 3: INSERT CARD PROGRESS ENTRIES ---
        while (!success && retryCount < maxRetries) {
          const { error } = await supabase
            .from(progressTable)
            .insert(progressChunk);

          if (!error) {
            success = true;
          } else {
            retryCount++;
            console.warn(
              `Progress chunk failed (attempt ${retryCount}). Retrying...`,
              error,
            );
            await new Promise((res) => setTimeout(res, retryCount * 2000));
          }
        }

        if (!success)
          throw new Error(
            "Card data written, but progress profile mapping failed.",
          );

        const newProgress = Math.min(i + CHUNK_SIZE, total);
        setProcessingProgress({ current: newProgress, total });

        console.log(
          `Successfully mapped ${newProgress} / ${total} database entities.`,
        );
        await new Promise((res) => setTimeout(res, 50));
      }
    } catch (err) {
      console.error("Batch upload transaction aborted:", err);
      // Clean up orphaned deck record structural shells if execution drops mid-way
      await supabase.from("decks").delete().eq("id", deckId);
      throw err;
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

      const language = deckSettings.language.trim().toLowerCase();
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
            study_mode: study_mode,
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

      const deckId = newDeck.id;
      console.log("New Deck Created with ID:", deckId);

      // Upload cards into the determined table target
      await uploadCards(deckId, targetTable);

      await dispatch(fetchDecks()).unwrap();
    } catch (err) {
      console.error("Import failed:", err);
      setUploadError(err.message || "Error during upload execution.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    selectedFile,
    selectedType,
    setSelectedType,
    fileContent,
    deckSettings,
    setDeckSettings,
    downloadTemplate,
    existingLanguages,
    isAddingLanguage,
    setIsAddingLanguage,
    uploadError,
    isDragging,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileUpload,
    hasHeaders,
    setHasHeaders,
    getFields,
    handleSwap,
    mappedColumns,
    setMappedColumns,
    isProcessing,
    createDeck,
    isCheckingName,
    isNameTaken,
    processingProgress,
  };
};
