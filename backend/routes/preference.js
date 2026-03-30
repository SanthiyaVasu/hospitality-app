const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST /api/preference/submit
router.post("/submit", async (req, res) => {
  const {
    name, email, phone, nationality,
    room_type, bed_type, floor_preference, dietary,
    amenities, activities, special_requests,
    budget_range, stay_purpose, loyalty_member, loyalty_number,
  } = req.body;

  if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

  try {
    const result = await pool.query(
      `INSERT INTO guest_preferences 
       (name, email, phone, nationality, room_type, bed_type, floor_preference,
        dietary, amenities, activities, special_requests, budget_range,
        stay_purpose, loyalty_member, loyalty_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id`,
      [
        name, email, phone || null, nationality || null,
        room_type || null, bed_type || null, floor_preference || null,
        dietary || null, amenities || [], activities || [],
        special_requests || null, budget_range || null,
        stay_purpose || null, loyalty_member || false, loyalty_number || null,
      ]
    );

    res.json({ success: true, preferenceId: result.rows[0].id, message: "Preferences saved successfully" });
  } catch (err) {
    console.error("Preference submit error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/preference/all
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM guest_preferences ORDER BY submitted_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;