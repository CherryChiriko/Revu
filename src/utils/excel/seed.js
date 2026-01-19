const fetch = require("node-fetch");
const fs = require("fs");
require("dotenv").config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

async function seedTable(filePath, table) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log(`Seeding ${data.length} rows into table ${table}`);

  for (const row of data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      console.error("Failed to insert row:", await res.text());
    }
  }

  console.log(`✅ Seeded ${table} from ${filePath}`);
}

(async () => {
  // await seedTable("./src/data/cards-hsk1.json", "cards_c");
  // await seedTable("./src/data/cards-hiragana.json", "cards_a");
  await seedTable("./src/data/decks.json", "decks");
})();
