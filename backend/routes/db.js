const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/db/stats
router.get("/stats", async (req, res) => {
  try {
    const guests = await pool.query("SELECT COUNT(*) FROM guests");
    const profiles = await pool.query("SELECT COUNT(*) FROM social_profiles");
    const analysis = await pool.query("SELECT COUNT(*) FROM guest_analysis");
    const preferences = await pool.query("SELECT COUNT(*) FROM guest_preferences");
    const personaStats = await pool.query("SELECT persona, COUNT(*) as count FROM guest_analysis GROUP BY persona ORDER BY count DESC");
    res.json({
      guests: parseInt(guests.rows[0].count),
      socialProfiles: parseInt(profiles.rows[0].count),
      analysed: parseInt(analysis.rows[0].count),
      preferences: parseInt(preferences.rows[0].count),
      personaBreakdown: personaStats.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;