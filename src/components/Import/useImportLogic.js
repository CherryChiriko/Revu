import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../utils/supabaseClient";
import { generateReading } from "./generateReading";
import Papa from "papaparse";
import * as XLSX from "xlsx";

import { useNavigate } from "react-router-dom";

export const useImportLogic = () => {
  const navigate = useNavigate();

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
      const { data } = await supabase
        .from("decks")
        .select("language")
        .eq("user_id", user.id);

      // Get unique, cleaned values
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

    // 1. Determine the file details based on selection
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

    // 2. Execute the download logic once
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

  // --- Helper: Parse CSV (.csv) ---
  const parseCSV = (file) => {
    Papa.parse(file, {
      header: hasHeaders,
      skipEmptyLines: true,
      encoding: "UTF-8",
      delimiter: "", // AUTO-DETECT
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
          console.log(normalized);
          setFileContent(normalized);
        } else {
          console.log(results.data);
          setFileContent(results.data);
        }
      },
      error: (err) => setUploadError("Error parsing CSV: " + err.message),
    });
  };

  // --- Helper: Parse Excel (.xlsx, .xls) ---
  const parseExcel = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // ALWAYS read as raw rows first
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // <-- ARRAY OF ARRAYS
          blankrows: false,
          defval: "",
        });
        console.log("rows", rows);

        if (!rows.length) {
          setUploadError("Excel file is empty.");
          return;
        }

        let normalized;

        if (hasHeaders) {
          // 1. Extract the first row as headers
          const headers = rows[0];

          // 2. Map the remaining rows using the header strings as keys
          normalized = rows.slice(1).map((row) =>
            row.reduce((acc, cell, index) => {
              if (cell !== "" && cell !== null && cell !== undefined) {
                // Use the header name if it exists, otherwise fallback to index
                const key = headers[index] || index;
                acc[key] = cell;
              }
              return acc;
            }, {}),
          );
        } else {
          // Logic for no headers (numeric keys)
          normalized = rows.map((row) =>
            row.reduce((acc, cell, index) => {
              if (cell !== "" && cell !== null && cell !== undefined) {
                acc[index] = cell;
              }
              return acc;
            }, {}),
          );
        }

        console.log("Normalized Data:", normalized);
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

    // Get the extension (e.g., "csv", "xlsx")
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
  // Extract the file processing logic so both Drop and Click can use it
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

  //  -------------- Interpret file -------------- //
  const getFields = () => {
    switch (selectedType) {
      case 1: // Standard
        return [
          { key: "front", label: "Front (Word)", required: true },
          { key: "back", label: "Back (Meaning)", required: true },
          { key: "audioUrl", label: "Audio URL", required: false },
        ];
      case 2: // Chinese writing
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

  // The Swap Function
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
  const [processingProgress, setProcessingProgress] = useState(0);

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

  const study_mode = getStudyMode();
  const table = "cards_" + study_mode.toLowerCase();

  const prepareCardsForInsert = (row) => {
    switch (selectedType) {
      case 1:
        return {
          front: row[mappedColumns.front],
          back: row[mappedColumns.back],
          audioUrl: row[mappedColumns.audioUrl] || null,
          createdAt: new Date(),
        };
      case 2:
        console.log(
          "row",
          mappedColumns.reading,
          row[mappedColumns.reading] || null,
          row[mappedColumns.reading],
        );
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

        console.log("result here", reading, strokeColors, tones);
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
    // Guard: If front or back mapping is missing, don't process yet
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
  }, [fileContent, mappedColumns, selectedType]); // Only re-run when these change

  const uploadCards = async (deckId) => {
    try {
      // 1. Prepare all cards first
      allCards.forEach((card) => {
        card.deck_id = deckId;
      });

      const CHUNK_SIZE = 400;

      for (let i = 0; i < allCards.length; i += CHUNK_SIZE) {
        const chunk = allCards.slice(i, i + CHUNK_SIZE);

        let retryCount = 0;
        const maxRetries = 3;
        let success = false;

        while (!success && retryCount < maxRetries) {
          const { error } = await supabase.from(table).insert(chunk);

          if (!error) {
            success = true;
          } else {
            retryCount++;
            console.warn(
              `Chunk failed (attempt ${retryCount}). Retrying in ${
                retryCount * 2
              }s...`,
            );
            // Wait longer each time it fails (Exponential Backoff)
            await new Promise((res) => setTimeout(res, retryCount * 2000));
          }
        }

        if (!success)
          throw new Error(
            "Server is unresponsive after multiple attempts. Please try again later.",
          );

        const total = allCards.length;
        // Calculate the progress locally
        const newProgress = Math.min(i + CHUNK_SIZE, total);

        // Update UI state
        setProcessingProgress(newProgress);

        // Log the local variable so you see real numbers in console
        console.log(`Successfully uploaded ${newProgress} / ${total}`);

        // Yield to event loop to keep UI responsive
        await new Promise((res) => setTimeout(res, 50));
      }

      // Success!
    } catch (err) {
      console.error("Batch upload failed:", err);

      await supabase.from("decks").delete().eq("id", deckId);
      await supabase.from(table).delete().eq("deck_id", deckId);

      setUploadError(
        "Error during upload. The deck and cards were removed to prevent data corruption.",
      );
    }
  };

  const createDeck = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setUploadError(null);

    try {
      // 1. Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const language = deckSettings.language.trim().toLowerCase();
      const formattedLanguage =
        language.charAt(0).toUpperCase() + language.slice(1);

      // 2. Insert the deck and select the new record back
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
            mastered: 0,
            learning: 0,
            new: allCards.length,
            last_reviewed: null,
            created_at: new Date(),
          },
        ])
        .select() // This is critical: it returns the inserted row
        .single(); // Since we only inserted one deck, get it as an object

      const deckId = newDeck.id;
      console.log("New Deck Created with ID:", deckId);

      // 3. Now proceed to upload the cards
      await uploadCards(deckId);
    } catch (err) {
      console.error("Import failed:", err);
      setUploadError(err.message);
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
