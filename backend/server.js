require("dotenv").config();

const express = require("express");
const cors = require("cors");

const guestRoutes = require("./routes/guest");
const batchRoutes = require("./routes/batch");
const preferenceRoutes = require("./routes/preference");
const dbRoutes = require("./routes/db");
const emailRoutes = require("./routes/email");

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// CORS CONFIGURATION
// ======================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://hospitality-app-1.onrender.com",
      "https://hospitality-frontend-d1zw.onrender.com",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// ROUTES
// ======================
app.use("/api/guest", guestRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/preference", preferenceRoutes);
app.use("/api/db", dbRoutes);
app.use("/api/email", emailRoutes);

// ======================
// HEALTH CHECK
// ======================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ======================
// ROOT ROUTE
// ======================
app.get("/", (req, res) => {
  res.json({
    message: "🏨 Hospitality Intelligence API",
    status: "running",
  });
});
app.get("/api/debug-dedupe", async (req, res) => {
  const pool = require("./db");
  try {
    const result = await pool.query(`
      DELETE FROM guest_stay_history
      WHERE id NOT IN (
        SELECT MIN(id) FROM guest_stay_history
        GROUP BY email, check_in_date, check_out_date, room_type
      )
    `);
    const remaining = await pool.query("SELECT COUNT(*) as count FROM guest_stay_history");
    res.json({ deleted: result.rowCount, remaining: remaining.rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ======================
// START SERVER
// ======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🏨 Hospitality Intelligence Server running on port ${PORT}`);
  console.log(`Health Check: /api/health`);
});