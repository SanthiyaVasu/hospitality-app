require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const guestRoutes      = require("./routes/guest");
const batchRoutes      = require("./routes/batch");
const preferenceRoutes = require("./routes/preference");
const dbRoutes         = require("./routes/db");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS — allow all frontend URLs ──────────────────────────
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://hospitality-app-39zz.onrender.com",
    "https://hospitality-frontend.onrender.com",
    "https://hospitality-frontend-app.onrender.com",
    "https://hospitality-frontend-d1zw.onrender.com",   // ← YOUR ACTUAL URL
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  methods:     ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────
app.use("/api/guest",      guestRoutes);
app.use("/api/batch",      batchRoutes);
app.use("/api/preference", preferenceRoutes);
app.use("/api/db",         dbRoutes);

const emailRoutes = require("./routes/email");
app.use("/api/email", emailRoutes);

// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Root ─────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "🏨 Hospitality Intelligence API", status: "running" });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🏨 Hospitality Intelligence Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});