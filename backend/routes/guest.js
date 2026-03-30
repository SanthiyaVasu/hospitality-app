const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const pool = require("../db");
const { searchGuest } = require("../search");
const { analyzeText } = require("../nlp");

// POST /api/guest/lookup
router.post("/lookup", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

  try {
    const emailHash = crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
    const emailLocal = email.split("@")[0];
    const emailDomain = email.split("@")[1] || "";

    // Step 1: Search across platforms
    const { found, scrapedData, snippets } = await searchGuest(email, name);

    // Step 2: NLP Analysis
    const allText = [...snippets, ...Object.values(scrapedData)];
    const analysis = analyzeText(allText.length > 0 ? allText : [name, emailLocal]);

    // Step 3: Save to DB
    let guestId;
    const existing = await pool.query("SELECT id FROM guests WHERE email_hash = $1", [emailHash]);
    if (existing.rows.length > 0) {
      guestId = existing.rows[0].id;
      await pool.query("UPDATE guests SET name=$1 WHERE id=$2", [name, guestId]);
    } else {
      const ins = await pool.query(
        "INSERT INTO guests (name, email_hash, email_local, email_domain) VALUES ($1,$2,$3,$4) RETURNING id",
        [name, emailHash, emailLocal, emailDomain]
      );
      guestId = ins.rows[0].id;
    }

    // Save social profiles
    await pool.query("DELETE FROM social_profiles WHERE guest_id=$1", [guestId]);
    for (const [platform, url] of Object.entries(found)) {
      await pool.query(
        "INSERT INTO social_profiles (guest_id, platform, profile_url) VALUES ($1,$2,$3)",
        [guestId, platform, url]
      );
    }

    // Save scraped data
    await pool.query("DELETE FROM scraped_data WHERE guest_id=$1", [guestId]);
    for (const [platform, text] of Object.entries(scrapedData)) {
      await pool.query(
        "INSERT INTO scraped_data (guest_id, platform, raw_text, word_count) VALUES ($1,$2,$3,$4)",
        [guestId, platform, text, text.split(" ").length]
      );
    }

    // Save analysis
    await pool.query("DELETE FROM guest_analysis WHERE guest_id=$1", [guestId]);
    await pool.query(
      `INSERT INTO guest_analysis 
       (guest_id, persona, luxury_score, business_score, leisure_score, adventure_score,
        family_score, food_score, tech_score, eco_score, arts_score, sports_score,
        sentiment_score, keywords_detected, data_quality, snippets_count,
        room_recommendation, personalized_offer, staff_note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
      [
        guestId, analysis.persona,
        analysis.scores.luxury, analysis.scores.business, analysis.scores.leisure,
        analysis.scores.adventure, analysis.scores.family, analysis.scores.food,
        analysis.scores.tech, analysis.scores.eco, analysis.scores.arts, analysis.scores.sports,
        analysis.sentimentScore, analysis.keywords.join(","),
        analysis.dataQuality, analysis.snippetsCount,
        analysis.roomRecommendation, analysis.personalizedOffer, analysis.staffNote,
      ]
    );

    res.json({
      success: true,
      guestId,
      guest: { name, email, emailLocal, emailDomain },
      profiles: found,
      scrapedPlatforms: Object.keys(scrapedData),
      analysis,
    });
  } catch (err) {
    console.error("Lookup error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/guest/all
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.id, g.name, g.email_local, g.email_domain, g.created_at,
             ga.persona, ga.data_quality, ga.room_recommendation,
             COUNT(sp.id) as profile_count
      FROM guests g
      LEFT JOIN guest_analysis ga ON ga.guest_id = g.id
      LEFT JOIN social_profiles sp ON sp.guest_id = g.id
      GROUP BY g.id, ga.persona, ga.data_quality, ga.room_recommendation
      ORDER BY g.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/guest/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await pool.query("SELECT * FROM guests WHERE id=$1", [id]);
    const profiles = await pool.query("SELECT * FROM social_profiles WHERE guest_id=$1", [id]);
    const analysis = await pool.query("SELECT * FROM guest_analysis WHERE guest_id=$1", [id]);
    const scraped = await pool.query("SELECT platform, word_count, scraped_at FROM scraped_data WHERE guest_id=$1", [id]);
    res.json({ guest: guest.rows[0], profiles: profiles.rows, analysis: analysis.rows[0], scraped: scraped.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;