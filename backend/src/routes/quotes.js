const express = require("express");
const https = require("https");
const fs = require("fs/promises");
const path = require("path");

const router = express.Router();
const CACHE_PATH = path.join(__dirname, "..", "data", "quotes-cache.json");
const MAX_HISTORY = 365;

const readCache = async () => {
  try {
    const raw = await fs.readFile(CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      date: parsed.date || null,
      quote: parsed.quote || null,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return { date: null, quote: null, history: [] };
  }
};

const writeCache = async (cache) => {
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
};

const fetchRandomQuote = () =>
  new Promise((resolve, reject) => {
    https
      .get("https://zenquotes.io/api/random", (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            const item = Array.isArray(parsed) ? parsed[0] : parsed;
            if (!item || !item.q) {
              return reject(new Error("Invalid quote response"));
            }
            resolve({ text: item.q, author: item.a || "Unknown" });
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });

router.get("/today", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const cache = await readCache();

    if (cache.date === today && cache.quote) {
      return res.json(cache.quote);
    }

    const used = new Set((cache.history || []).map((q) => q.text));
    let quote = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = await fetchRandomQuote();
      if (!used.has(candidate.text)) {
        quote = candidate;
        break;
      }
    }

    if (!quote) {
      quote = await fetchRandomQuote();
    }

    const nextHistory = [quote, ...(cache.history || [])].slice(0, MAX_HISTORY);
    const nextCache = { date: today, quote, history: nextHistory };
    await writeCache(nextCache);

    return res.json(quote);
  } catch (err) {
    return res.status(502).json({ message: "Failed to fetch quote" });
  }
});

module.exports = router;
