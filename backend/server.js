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
app.get("/api/debug-seed", async (req, res) => {
  const pool = require("./db");
  const sampleStays = [
    { email: "mohan.raj@arival.ai",          name: "Mohan Raj",      checkIn: "2025-03-12", checkOut: "2025-03-15", nights: 3, room: "Executive Suite",      persona: "Business Traveler", amount: 24500, points: 245 },
    { email: "priya.sharma@infosys.com",     name: "Priya Sharma",   checkIn: "2025-05-02", checkOut: "2025-05-04", nights: 2, room: "Deluxe Room",          persona: "Leisure Traveler",  amount: 14200, points: 142 },
    { email: "arjun.mehta@tcs.com",          name: "Arjun Mehta",    checkIn: "2025-06-18", checkOut: "2025-06-22", nights: 4, room: "Presidential Suite",   persona: "Luxury Traveler",   amount: 89000, points: 890 },
    { email: "divya.nair@wipro.com",         name: "Divya Nair",     checkIn: "2025-07-05", checkOut: "2025-07-06", nights: 1, room: "Standard Room",        persona: "Business Traveler", amount: 6800,  points: 68  },
    { email: "rahul.verma@accenture.com",    name: "Rahul Verma",    checkIn: "2025-08-14", checkOut: "2025-08-18", nights: 4, room: "Family Suite",         persona: "Family Traveler",   amount: 31200, points: 312 },
    { email: "sneha.iyer@cognizant.com",     name: "Sneha Iyer",     checkIn: "2025-09-01", checkOut: "2025-09-03", nights: 2, room: "Deluxe Room",          persona: "Food Traveler",     amount: 17600, points: 176 },
    { email: "vikram.singh@hcl.com",         name: "Vikram Singh",   checkIn: "2025-10-09", checkOut: "2025-10-11", nights: 2, room: "Adventure Base Room",  persona: "Adventure Traveler",amount: 12400, points: 124 },
    { email: "ananya.gupta@flipkart.com",    name: "Ananya Gupta",   checkIn: "2025-11-20", checkOut: "2025-11-23", nights: 3, room: "Executive Suite",      persona: "Business Traveler", amount: 27800, points: 278 },
    { email: "karthik.raman@zoho.com",       name: "Karthik Raman",  checkIn: "2025-12-05", checkOut: "2025-12-07", nights: 2, room: "Eco Green Room",       persona: "Eco Traveler",      amount: 11500, points: 115 },
    { email: "meera.pillai@swiggy.com",      name: "Meera Pillai",   checkIn: "2026-01-15", checkOut: "2026-01-17", nights: 2, room: "Art Deco Suite",       persona: "Arts Traveler",     amount: 19900, points: 199 },
  ];
  try {
    for (const s of sampleStays) {
      await pool.query(
        `INSERT INTO guest_stay_history
         (email, guest_name, check_in_date, check_out_date, nights_stayed, room_type, persona, amount_spent, loyalty_points)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [s.email, s.name, s.checkIn, s.checkOut, s.nights, s.room, s.persona, s.amount, s.points]
      );
    }
    res.json({ success: true, seeded: sampleStays.length });
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