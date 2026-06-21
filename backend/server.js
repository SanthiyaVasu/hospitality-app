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
app.get("/api/debug-db", async (req, res) => {
  const pool = require("./db");
  try {
    const dbInfo = await pool.query("SELECT current_database() as db_name, inet_server_addr() as server_ip");
    const stayCount = await pool.query("SELECT COUNT(*) as count FROM guest_stay_history");
    const stayEmails = await pool.query("SELECT email FROM guest_stay_history");
    res.json({
      connectedTo: dbInfo.rows[0],
      totalStayRecords: stayCount.rows[0].count,
      emails: stayEmails.rows.map(r => r.email),
      usingDatabaseUrl: !!process.env.DATABASE_URL,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
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

// ======================
// START SERVER
// ======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🏨 Hospitality Intelligence Server running on port ${PORT}`);
  console.log(`Health Check: /api/health`);
});