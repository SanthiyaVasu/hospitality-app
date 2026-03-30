require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const guestRoutes = require("./routes/guest");
const batchRoutes = require("./routes/batch");
const preferenceRoutes = require("./routes/preference");
const dbRoutes = require("./routes/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/guest", guestRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/preference", preferenceRoutes);
app.use("/api/db", dbRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🏨 Hospitality Intelligence Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});