import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { generateMetadata } from "../../utils/excel/generateMetadata";
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
  const [deckSettings, setDeckSettings] = useState({});

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
      delimiter: "", // AUTO-DETECT
      delimitersToGuess: [",", ";", "\t", "|"],
      complete: (results) => {
        if (!hasHeaders) {
          const normalized = results.data.map((row) => ({ ...row }));
          setFileContent(normalized);
        } else {
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
            }, {})
          );
        } else {
          // Logic for no headers (numeric keys)
          normalized = rows.map((row) =>
            row.reduce((acc, cell, index) => {
              if (cell !== "" && cell !== null && cell !== undefined) {
                acc[index] = cell;
              }
              return acc;
            }, {})
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
          { key: "word", label: "Character/Word", required: true },
          { key: "reading", label: "Reading (Pinyin/Kana)", required: true },
          { key: "meaning", label: "Meaning", required: true },
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

  //  -------------- Send out result -------------- //

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const prepareCardsForInsert = (fileContent, column, deckId) => {
    return fileContent
      .map((row) => ({
        front: row[column.word],
        back: row[column.meaning],
        audioUrl: row[column.audioUrl] || null,
        deck_id: deckId,
      }))
      .filter((card) => card.front); // Safety check: don't insert rows with no front text
  };

  // const handleFileUpload = (event) => {

  //   setSelectedFile(file);

  //   // Mock file parsing (in real implementation, use xlsx or csv parser)
  //   const mockData = [
  //     { col1: "あ", col2: "a", col3: "a", col4: "vowel sound a" },
  //     { col1: "か", col2: "ka", col3: "ka", col4: "consonant-vowel ka" },
  //     { col1: "さ", col2: "sa", col3: "sa", col4: "consonant-vowel sa" },
  //     { col1: "你", col2: "nǐ", col3: "ni3", col4: "you" },
  //     { col1: "好", col2: "hǎo", col3: "hao3", col4: "good" },
  //   ];

  //   setFileContent(mockData);
  //   setCurrentStep(2);

  //   // showNotification(
  //   //   "File Uploaded",
  //   //   `Successfully loaded ${mockData.length} rows from ${file.name}`
  //   // );
  // };

  // const [columnMappings, setColumnMappings] = useState({
  //   word: "",
  //   meaning: "",
  //   reading: "",
  //   audioUrl: "",
  // });

  // const [deckSettings, setDeckSettings] = useState({
  //   name: "",
  //   description: "",
  //   language: "japanese",
  //   tags: "",
  // });

  // const handleImport = async () => {
  //   setIsProcessing(true);
  //   try {
  //     const {
  //       data: { user },
  //     } = await supabase.auth.getUser();

  //     // 1. Create Deck
  //     const { data: deck, error: deckErr } = await supabase
  //       .from("decks")
  //       .insert([
  //         {
  //           name: deckSettings.name,
  //           description: deckSettings.description,
  //           language: deckSettings.language,
  //           study_mode: deckSettings.language === "chinese" ? "C" : "A",
  //           user_id: user.id,
  //         },
  //       ])
  //       .select()
  //       .single();

  //     if (deckErr) throw deckErr;

  //     // 2. Prepare Cards
  //     const table = deck.study_mode === "C" ? "cards_c" : "cards_a";
  //     const cardsToInsert = fileContent.map((row) => {
  //       const frontText = row[columnMappings.word];
  //       const meta = generateMetadata(frontText, deckSettings.language);
  //       const baseCard = {
  //         deck_id: deck.id,
  //         front: frontText,
  //         back: row[columnMappings.meaning],
  //         audioUrl: row[columnMappings.audioUrl] || null,
  //       };

  //       return deck.study_mode === "C"
  //         ? {
  //             ...baseCard,
  //             reading: meta.reading,
  //             tones: meta.tones,
  //             strokeColors: meta.strokeColors,
  //           }
  //         : {
  //             ...baseCard,
  //             reading: row[columnMappings.reading] || meta.reading,
  //           };
  //     });

  //     // 3. Batch Insert & Progress Initialization
  //     const { data: newCards, error: cardErr } = await supabase
  //       .from(table)
  //       .insert(cardsToInsert)
  //       .select();
  //     if (cardErr) throw cardErr;

  //     const progressTable =
  //       deck.study_mode === "C" ? "card_c_progress" : "card_a_progress";
  //     const progressEntries = newCards.map((card) => ({
  //       card_id: card.id,
  //       user_id: user.id,
  //       deck_id: deck.id,
  //       status: "new",
  //     }));

  //     await supabase.from(progressTable).insert(progressEntries);
  //     navigate("/decks");
  //   } catch (error) {
  //     console.error("Import Error:", error);
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  // Inside your import function
  // const cardsToInsert = fileContent.map(row => ({
  //   // The data keys match the public.cards_a schema
  //   front: row[columnMappings.word],        // Required
  //   back: row[columnMappings.meaning],      // Required
  //   audioUrl: row[columnMappings.audioUrl] || null,
  //   deck_id: newDeckId,
  //   // createdAt is default now() in DB
  // })).filter(card => card.front && card.front.trim() !== "");

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
    processingProgress,
  };
};
