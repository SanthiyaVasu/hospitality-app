const axios = require("axios");
require("dotenv").config();

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// ── Fetch real hotels from OpenStreetMap by city ─────────────
async function fetchHotels(city, persona, limit = 6) {
  try {
    // Sanitize city name — remove special chars that break Overpass QL syntax
    city = (city || "Bengaluru").replace(/["\\]/g, "").trim();
    if (!city) city = "Bengaluru";

    // Map persona to hotel type keywords
    const typeMap = {
      luxury:   ["5 star","luxury","palace","grand","oberoi","taj","leela","marriott","hyatt","hilton","ritz"],
      business: ["business","executive","courtyard","novotel","ibis","holiday inn","radisson","sheraton"],
      leisure:  ["resort","boutique","heritage","garden","lake","view"],
      adventure:["hostel","backpacker","inn","lodge","camp"],
      family:   ["family","suite","apartment","serviced"],
      food:     ["boutique","heritage"],
      eco:      ["eco","green","sustainable","nature"],
      arts:     ["heritage","boutique","art","cultural"],
      sports:   ["sports","fitness","spa","wellness"],
    };

    const keywords = typeMap[persona] || typeMap.business;

    // Overpass query to find hotels in the city
    const query = `
      [out:json][timeout:10];
      (
        node["tourism"="hotel"]["name"](area["name"="${city}"]["place"~"city|town"]->.a);
        way["tourism"="hotel"]["name"](area["name"="${city}"]["place"~"city|town"]->.a);
      );
      out ${limit * 3} qt;
    `;

    console.log("Overpass query for city:", JSON.stringify(city));

    const res = await axios.post(OVERPASS_URL,
      `data=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":   "HospitalityIntelligenceSuite/1.0 (contact: " + (process.env.EMAIL_USER || "admin@example.com") + ")",
          "Accept":       "application/json",
        },
        timeout: 10000,
      }
    );

    let hotels = res.data.elements || [];

    // Filter hotels with names only
    hotels = hotels.filter(h => h.tags?.name && h.tags.name.length > 2);

    // Score hotels by persona keywords
    hotels = hotels.map(h => {
      const name = (h.tags.name || "").toLowerCase();
      const score = keywords.filter(k => name.includes(k)).length;
      return { ...h, score };
    });

    // Sort by score desc, take top N
    hotels.sort((a, b) => b.score - a.score);
    hotels = hotels.slice(0, limit);

    // If not enough from OSM, generate curated list
    if (hotels.length < 3) {
      return getCuratedHotels(city, persona, limit);
    }

    return hotels.map(h => ({
      name:    h.tags.name,
      stars:   h.tags.stars || h.tags["tourism:stars"] || null,
      address: [h.tags["addr:street"], h.tags["addr:city"]].filter(Boolean).join(", ") || city,
      phone:   h.tags.phone || null,
      website: h.tags.website || null,
      lat:     h.lat || h.center?.lat,
      lon:     h.lon || h.center?.lon,
    }));

  } catch (err) {
    console.log("Overpass error:", err.message);
    console.log("Overpass error response body:", JSON.stringify(err.response?.data));
    console.log("— using curated list");
    return getCuratedHotels(city, persona, limit);
  }
}

// ── Curated hotel lists per city + persona ───────────────────
function getCuratedHotels(city, persona, limit = 6) {
  const cityMap = {
    "Bengaluru": {
      luxury:   ["The Leela Palace Bengaluru","ITC Gardenia","The Ritz-Carlton Bengaluru","JW Marriott Bengaluru","Taj West End","Conrad Bengaluru"],
      business: ["Novotel Bengaluru Techpark","Courtyard by Marriott","Sheraton Grand Bengaluru","Radisson Blu Atria","Ibis Bengaluru City Centre","Hyatt Centric MG Road"],
      leisure:  ["The Oberoi Bengaluru","Lemon Tree Premier","Vivanta Bengaluru","Royal Orchid Hotel","The Paul Bangalore","Klm Fashion Mall Hotel"],
      default:  ["The Leela Palace","Taj West End","ITC Gardenia","Novotel Bengaluru","Radisson Blu","Hyatt Centric"],
    },
    "Mumbai": {
      luxury:   ["The Taj Mahal Palace","The Oberoi Mumbai","Four Seasons Hotel Mumbai","St. Regis Mumbai","Trident Nariman Point","ITC Grand Central"],
      business: ["Novotel Mumbai Juhu Beach","Courtyard by Marriott","Renaissance Mumbai","Hyatt Regency Mumbai","Westin Mumbai Garden City","Radisson Blu Mumbai"],
      default:  ["The Taj Mahal Palace","The Oberoi Mumbai","Four Seasons Mumbai","Novotel Mumbai","Hyatt Regency","Radisson Blu"],
    },
    "Delhi": {
      luxury:   ["The Imperial New Delhi","The Taj Mahal Hotel","Oberoi New Delhi","The Lodhi","Leela Palace New Delhi","ITC Maurya"],
      business: ["Hyatt Regency Delhi","Novotel Delhi Aerocity","Radisson Blu Plaza Delhi","Courtyard by Marriott","Sheraton New Delhi","Crowne Plaza Delhi"],
      default:  ["The Imperial","The Lodhi","ITC Maurya","Hyatt Regency Delhi","Novotel Aerocity","Radisson Blu"],
    },
    "Chennai": {
      luxury:   ["ITC Grand Chola","The Leela Palace Chennai","Taj Coromandel","Hyatt Regency Chennai","The Park Chennai","Radisson Blu Hotel GRT"],
      business: ["Novotel Chennai OMR","Courtyard Chennai","Hilton Chennai","Crowne Plaza Chennai","Four Points by Sheraton","Ibis Chennai City Centre"],
      default:  ["ITC Grand Chola","Taj Coromandel","The Leela Chennai","Hyatt Regency","Novotel Chennai","Hilton Chennai"],
    },
    "Hyderabad": {
      luxury:   ["ITC Kohenur","Taj Krishna","The Park Hyderabad","Novotel Hyderabad Convention Centre","Marriott Hyderabad","Trident Hyderabad"],
      business: ["Radisson Blu Plaza","Courtyard by Marriott HICC","Hyatt Hyderabad Gachibowli","Lemon Tree Premier HITEC","Ibis Hyderabad HITEC City","Avasa Hotel"],
      default:  ["ITC Kohenur","Taj Krishna","Novotel Hyderabad","Marriott Hyderabad","Radisson Blu","Hyatt Hyderabad"],
    },
    "Pune": {
      luxury:   ["JW Marriott Pune","Conrad Pune","The Westin Pune","Hyatt Pune","Taj Blue Diamond","Four Points by Sheraton Pune"],
      business: ["Novotel Pune Nagar Road","Courtyard by Marriott Pune","Radisson Blu Pune Kharadi","Ibis Pune Hinjewadi","Double Tree Pune","Lemon Tree Hotel Pune"],
      default:  ["JW Marriott Pune","Conrad Pune","Westin Pune","Hyatt Pune","Novotel Pune","Radisson Blu Pune"],
    },
  };

  const personaKey = ["luxury","business","leisure","adventure","family","food","eco","arts","sports"].includes(persona)
    ? (["luxury","business"].includes(persona) ? persona : "leisure")
    : "default";

  const cityData = cityMap[city] || cityMap["Bengaluru"];
  const names    = cityData[personaKey] || cityData.default || cityData.business;

  return names.slice(0, limit).map((name) => ({
    name,
    stars:   persona === "luxury" ? "5" : persona === "business" ? "4" : null,
    address: city,
    phone:   null,
    website: null,
    lat:     null,
    lon:     null,
  }));
}

// ── Fetch image via Pollinations.ai (free, no key, no rate limit) ──
function fetchHotelImage(hotelName, city, persona) {
  const personaQuery = {
    luxury:    "luxury hotel interior elegant chandelier",
    business:  "business hotel modern lobby professional",
    leisure:   "resort hotel pool scenic relaxing",
    adventure: "boutique hotel nature outdoor",
    family:    "family hotel suite comfortable",
    food:      "hotel restaurant fine dining elegant",
    eco:       "eco hotel green nature sustainable",
    arts:      "boutique hotel art cultural elegant",
    sports:    "hotel gym spa fitness modern",
  };
  const query = (personaQuery[persona] || "hotel") + " " + city + " professional photography";
  const seed  = Math.abs((hotelName || "hotel").split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const url   = "https://image.pollinations.ai/prompt/" +
    encodeURIComponent(query) +
    "?width=480&height=320&nologo=true&seed=" + seed;

  return Promise.resolve({
    url:   url,
    small: url,
    thumb: url,
    photographer: null,
  });
}

// ── Main: get hotel recommendations with images ───────────────
async function getHotelRecommendations(city, persona, adType) {
  if (!city || city === "Unknown") city = "Bengaluru";

  const cityMap = { "Bangalore": "Bengaluru", "New Delhi": "Delhi", "Bombay": "Mumbai" };
  city = cityMap[city] || city;

  console.log("Fetching hotels for " + city + " — persona: " + persona);

  const [hotels, image] = await Promise.all([
    fetchHotels(city, persona, 6),
    fetchHotelImage("luxury hotel", city, persona),
  ]);

  const hotelImages = await Promise.allSettled(
    hotels.slice(0, 6).map((h) => fetchHotelImage(h.name, city, persona))
  );

  return hotels.map((hotel, i) => ({
    ...hotel,
    image: hotelImages[i]?.value || image,
    persona,
    city,
  }));
}

module.exports = { getHotelRecommendations };