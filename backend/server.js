require("dotenv").config();
const express = require("express");
const cors = require("cors");

const guestRoutes = require("./routes/guest");
const batchRoutes = require("./routes/batch");
const preferenceRoutes = require("./routes/preference");
const dbRoutes = require("./routes/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "https://hospitality-frontend-d1zw.onrender.com",
    "http://localhost:3000",
    "http://10.64.105.213:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/guest", guestRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/preference", preferenceRoutes);
app.use("/api/db", dbRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🏨 Hospitality Intelligence Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});