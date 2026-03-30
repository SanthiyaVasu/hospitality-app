const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "hospitality",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err);
});

// Ensure all required tables exist
async function ensureTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS guests (
        id            SERIAL PRIMARY KEY,
        name          TEXT NOT NULL,
        email_hash    TEXT UNIQUE NOT NULL,
        email_local   TEXT,
        email_domain  TEXT,
        created_at    TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS social_profiles (
        id            SERIAL PRIMARY KEY,
        guest_id      INTEGER REFERENCES guests(id) ON DELETE CASCADE,
        platform      TEXT,
        profile_url   TEXT,
        created_at    TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS scraped_data (
        id          SERIAL PRIMARY KEY,
        guest_id    INTEGER REFERENCES guests(id) ON DELETE CASCADE,
        platform    TEXT,
        raw_text    TEXT,
        word_count  INTEGER DEFAULT 0,
        scraped_at  TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS guest_analysis (
        id                  SERIAL PRIMARY KEY,
        guest_id            INTEGER REFERENCES guests(id) ON DELETE CASCADE,
        persona             TEXT,
        luxury_score        FLOAT DEFAULT 0,
        business_score      FLOAT DEFAULT 0,
        leisure_score       FLOAT DEFAULT 0,
        adventure_score     FLOAT DEFAULT 0,
        family_score        FLOAT DEFAULT 0,
        food_score          FLOAT DEFAULT 0,
        tech_score          FLOAT DEFAULT 0,
        eco_score           FLOAT DEFAULT 0,
        arts_score          FLOAT DEFAULT 0,
        sports_score        FLOAT DEFAULT 0,
        sentiment_score     FLOAT DEFAULT 0,
        keywords_detected   TEXT,
        data_quality        TEXT,
        snippets_count      INTEGER DEFAULT 0,
        room_recommendation TEXT,
        personalized_offer  TEXT,
        staff_note          TEXT,
        analysed_at         TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS guest_preferences (
        id                SERIAL PRIMARY KEY,
        name              TEXT NOT NULL,
        email             TEXT NOT NULL,
        phone             TEXT,
        nationality       TEXT,
        room_type         TEXT,
        bed_type          TEXT,
        floor_preference  TEXT,
        dietary           TEXT,
        amenities         TEXT[],
        activities        TEXT[],
        special_requests  TEXT,
        budget_range      TEXT,
        stay_purpose      TEXT,
        loyalty_member    BOOLEAN DEFAULT FALSE,
        loyalty_number    TEXT,
        submitted_at      TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ All tables verified/created");
  } catch (err) {
    console.error("Table creation error:", err.message);
  } finally {
    client.release();
  }
}

ensureTables();

module.exports = pool;