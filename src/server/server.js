import express from "express";
import cors from "cors";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = "./db.json";

// Helper: read/write JSON file
const readDB = async () => JSON.parse(await fs.readFile(DB_PATH, "utf-8"));
const writeDB = async (data) =>
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));

// === Routes ===

// Get cards due for a deck
app.get("/api/cards/deck/:deck_id/due", async (req, res) => {
  try {
    const { deck_id } = req.params;
    const db = await readDB();
    const now = new Date();
    const dueCards = db.cards.filter(
      (c) => c.deck_id === deck_id && new Date(c.due) <= now
    );
    res.json({ cards: dueCards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load cards" });
  }
});

// Review a card
app.post("/api/cards/:id/review", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const db = await readDB();

    const card = db.cards.find((c) => c.id === id);
    if (!card) return res.status(404).json({ error: "Card not found" });

    // --- SRS Logic (your same algorithm) ---
    let newInterval = 0;
    let newEase = card.ease;
    let newLapses = card.lapses;

    switch (rating) {
      case "again":
        newInterval = 1;
        newEase = Math.max(1.3, newEase - 0.2);
        newLapses += 1;
        break;
      case "hard":
        newInterval = card.interval > 0 ? card.interval * 1.2 : 2;
        break;
      case "good":
        newInterval = card.interval > 0 ? card.interval * newEase : 4;
        break;
      case "easy":
        newInterval = card.interval > 0 ? card.interval * newEase * 1.3 : 6;
        newEase = Math.min(2.5, newEase + 0.15);
        break;
      default:
        newInterval = card.interval;
    }

    const now = new Date();
    const newDue = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

    card.interval = newInterval;
    card.ease = newEase;
    card.lapses = newLapses;
    card.due = newDue.toISOString();

    await writeDB(db);

    res.json({ card });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to review card" });
  }
});

// Create a new card (optional)
app.post("/api/cards", async (req, res) => {
  try {
    const db = await readDB();
    const newCard = { id: uuidv4(), ...req.body };
    db.cards.push(newCard);
    await writeDB(db);
    res.json({ card: newCard });
  } catch (err) {
    res.status(500).json({ error: "Failed to create card" });
  }
});

app.listen(5000, () => {
  console.log("✅ Offline backend running at http://localhost:5000");
});
