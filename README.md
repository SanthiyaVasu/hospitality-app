# 🏨 Hospitality Guest Intelligence System
### Full-Stack React.js + Node.js Application

---

## 📁 Project Structure

```
hospitality-app/
├── backend/
│   ├── server.js           ← Express server entry point
│   ├── db.js               ← PostgreSQL connection + table creation
│   ├── nlp.js              ← NLP analysis engine
│   ├── search.js           ← Google/SerpAPI/DuckDuckGo search + scraping
│   ├── routes/
│   │   ├── guest.js        ← /api/guest/* (lookup, list, detail)
│   │   ├── batch.js        ← /api/batch/* (CSV upload, job status)
│   │   ├── preference.js   ← /api/preference/* (form submit, list)
│   │   └── db.js           ← /api/db/stats
│   ├── .env.example        ← Copy to .env and fill values
│   └── package.json
│
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js          ← Router + Sidebar layout
│   │   ├── index.js
│   │   ├── index.css       ← Global design system
│   │   └── pages/
│   │       ├── GuestLookup.js    ← Feature 1: Search by email
│   │       ├── BatchProcess.js   ← Feature 2: CSV upload
│   │       ├── PreferenceForm.js ← Feature 3: Guest form
│   │       └── Dashboard.js      ← Analytics & guest list
│   └── package.json
│
├── sample_guests.csv       ← Sample CSV for batch testing
└── README.md
```

---

## ⚙️ Setup Instructions

### Step 1 — Copy this folder to your project

Place the `hospitality-app/` folder anywhere on your computer.

### Step 2 — Setup Backend

```bash
cd hospitality-app/backend

# Copy env file and fill in values
copy .env.example .env
# Open .env and set DB_PASSWORD and API keys

# Install dependencies
npm install

# Start backend server
npm run dev
```

Backend runs at: **http://localhost:5000**

### Step 3 — Setup Frontend

Open a **new terminal window**:

```bash
cd hospitality-app/frontend

# Install dependencies
npm install

# Start React app
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Environment Variables (.env)

| Variable | Required | Description |
|---|---|---|
| `DB_HOST` | ✅ | PostgreSQL host (usually `localhost`) |
| `DB_PORT` | ✅ | PostgreSQL port (usually `5432`) |
| `DB_NAME` | ✅ | Your database name (`hospitality`) |
| `DB_USER` | ✅ | PostgreSQL username (`postgres`) |
| `DB_PASSWORD` | ✅ | Your PostgreSQL password |
| `GOOGLE_API_KEY` | ⭐ Recommended | Google Custom Search API key |
| `GOOGLE_CSE_ID` | ⭐ Recommended | Your CSE ID (`b3a0722ca67ec42b4`) |
| `SERPAPI_KEY` | Optional | SerpAPI fallback key |
| `YOUTUBE_API_KEY` | Optional | YouTube Data API key |

---

## 🚀 Features

### 1. Guest Lookup (`/`)
- Enter guest **name + email**
- Auto-searches Google for all linked profiles
- Scrapes LinkedIn, Instagram, GitHub, Reddit, YouTube
- Runs NLP analysis → assigns persona
- Saves everything to PostgreSQL
- Shows: profiles found, behaviour scores, room recommendation, offer

### 2. Batch Processing (`/batch`)
- Upload a **CSV file** with `name` and `email` columns
- Processes all guests automatically in background
- Live progress bar with real-time updates
- Shows results table as each guest completes
- All data saved to database

### 3. Guest Preference Form (`/preference`)
- Beautiful multi-section form
- Captures: room type, bed preference, dietary needs, amenities, activities
- Loyalty program fields
- Special requests textarea
- Saves to `guest_preferences` table

### 4. Dashboard (`/dashboard`)
- Live stats: total guests, social profiles, analysed count, preferences
- Bar chart + Pie chart of persona distribution
- Searchable guest table with all analysed guests
- Auto-refreshes every 10 seconds

---

## 🗄️ Database Tables

| Table | Contents |
|---|---|
| `guests` | Name, email hash, email local/domain |
| `social_profiles` | Platform URLs found per guest |
| `scraped_data` | Raw text scraped from each platform |
| `guest_analysis` | NLP scores, persona, room rec, offer |
| `guest_preferences` | Manual preference form submissions |

Tables are **auto-created** when the backend starts.

---

## 📋 CSV Format for Batch Processing

```csv
name,email
Santhosh Kumar,santhosh@gmail.com
Priya Sharma,priya@outlook.com
```

Column names must be exactly `name` and `email` (lowercase).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18 + React Router v6 |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (pg pool) |
| Search | Google CSE / SerpAPI / DuckDuckGo |
| Scraping | Axios + Cheerio |
| NLP | Custom keyword scoring engine |
| File Upload | Multer + csv-parse |

---

## ▶️ Quick Start Commands

```bash
# Terminal 1 - Backend
cd hospitality-app/backend && npm install && npm run dev

# Terminal 2 - Frontend  
cd hospitality-app/frontend && npm install && npm start
```

Then open **http://localhost:3000** in your browser.