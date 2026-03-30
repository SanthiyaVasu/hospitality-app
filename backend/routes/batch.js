const express = require("express");
const router = express.Router();
const multer = require("multer");
const { parse } = require("csv-parse");
const crypto = require("crypto");
const pool = require("../db");
const { searchGuest } = require("../search");
const { analyzeText } = require("../nlp");

const upload = multer({ storage: multer.memoryStorage() });

// Store active batch jobs in memory
const batchJobs = {};

// POST /api/batch/upload — starts a batch job
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const jobId = crypto.randomBytes(8).toString("hex");
  const csvContent = req.file.buffer.toString("utf8");

  // Parse CSV
  parse(csvContent, { columns: true, trim: true, skip_empty_lines: true }, async (err, records) => {
    if (err) return res.status(400).json({ error: "Invalid CSV format" });

    const guests = records.map((r) => ({
      name: r.name || r.Name || r.NAME || "",
      email: r.email || r.Email || r.EMAIL || "",
    })).filter((g) => g.name && g.email);

    if (guests.length === 0) return res.status(400).json({ error: "No valid name/email rows found in CSV" });

    // Initialize job
    batchJobs[jobId] = {
      total: guests.length,
      processed: 0,
      success: 0,
      failed: 0,
      status: "running",
      results: [],
      startedAt: new Date().toISOString(),
    };

    res.json({ jobId, total: guests.length, message: "Batch job started" });

    // Process in background
    processBatch(jobId, guests);
  });
});

async function processBatch(jobId, guests) {
  for (const guest of guests) {
    try {
      const emailHash = crypto.createHash("sha256").update(guest.email.toLowerCase().trim()).digest("hex");
      const emailLocal = guest.email.split("@")[0];
      const emailDomain = guest.email.split("@")[1] || "";

      const { found, scrapedData, snippets } = await searchGuest(guest.email, guest.name);
      const allText = [...snippets, ...Object.values(scrapedData)];
      const analysis = analyzeText(allText.length > 0 ? allText : [guest.name, emailLocal]);

      let guestId;
      const existing = await pool.query("SELECT id FROM guests WHERE email_hash=$1", [emailHash]);
      if (existing.rows.length > 0) {
        guestId = existing.rows[0].id;
        await pool.query("UPDATE guests SET name=$1 WHERE id=$2", [guest.name, guestId]);
      } else {
        const ins = await pool.query(
          "INSERT INTO guests (name, email_hash, email_local, email_domain) VALUES ($1,$2,$3,$4) RETURNING id",
          [guest.name, emailHash, emailLocal, emailDomain]
        );
        guestId = ins.rows[0].id;
      }

      await pool.query("DELETE FROM social_profiles WHERE guest_id=$1", [guestId]);
      for (const [platform, url] of Object.entries(found)) {
        await pool.query("INSERT INTO social_profiles (guest_id, platform, profile_url) VALUES ($1,$2,$3)", [guestId, platform, url]);
      }

      await pool.query("DELETE FROM scraped_data WHERE guest_id=$1", [guestId]);
      for (const [platform, text] of Object.entries(scrapedData)) {
        await pool.query("INSERT INTO scraped_data (guest_id, platform, raw_text, word_count) VALUES ($1,$2,$3,$4)", [guestId, platform, text, text.split(" ").length]);
      }

      await pool.query("DELETE FROM guest_analysis WHERE guest_id=$1", [guestId]);
      await pool.query(
        `INSERT INTO guest_analysis 
         (guest_id, persona, luxury_score, business_score, leisure_score, adventure_score,
          family_score, food_score, tech_score, eco_score, arts_score, sports_score,
          sentiment_score, keywords_detected, data_quality, snippets_count,
          room_recommendation, personalized_offer, staff_note)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [guestId, analysis.persona,
         analysis.scores.luxury, analysis.scores.business, analysis.scores.leisure,
         analysis.scores.adventure, analysis.scores.family, analysis.scores.food,
         analysis.scores.tech, analysis.scores.eco, analysis.scores.arts, analysis.scores.sports,
         analysis.sentimentScore, analysis.keywords.join(","),
         analysis.dataQuality, analysis.snippetsCount,
         analysis.roomRecommendation, analysis.personalizedOffer, analysis.staffNote]
      );

      batchJobs[jobId].results.push({ name: guest.name, email: guest.email, guestId, persona: analysis.persona, status: "success" });
      batchJobs[jobId].success++;
    } catch (err) {
      batchJobs[jobId].results.push({ name: guest.name, email: guest.email, status: "failed", error: err.message });
      batchJobs[jobId].failed++;
    }
    batchJobs[jobId].processed++;
    await delay(1000); // Rate limiting
  }
  batchJobs[jobId].status = "completed";
}

// GET /api/batch/status/:jobId
router.get("/status/:jobId", (req, res) => {
  const job = batchJobs[req.params.jobId];
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = router;