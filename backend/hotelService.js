const axios = require("axios");
require("dotenv").config();

// ── Fetch hotels — uses curated list directly (Overpass removed: too unreliable/slow on free tier) ──
async function fetchHotels(city, persona, limit = 6) {
  city = (city || "Bengaluru").replace(/["\\]/g, "").trim();
  if (!city) city = "Bengaluru";
  return getCuratedHotels(city, persona, limit);
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
    "Tiruppur": {
      luxury:   ["Hotel Asma Towers","Hotel Mass Grand","Hotel Rathna Residency","Hotel KK International","Hotel Hyfun Grand","Hotel Sangam International"],
      business: ["Hotel Mass Grand","Hotel Surya International","Hotel KK Residency","Hotel Pavithra Towers","Hotel Annpoorna Grand","Hotel City Centre"],
      leisure:  ["Hotel Rathna Residency","Hotel Asma Towers","Hotel Sangam International","Hotel Green Park","Hotel KK International","Hotel City Centre"],
      default:  ["Hotel Mass Grand","Hotel Asma Towers","Hotel Rathna Residency","Hotel KK International","Hotel Sangam International","Hotel Surya International"],
    },
    "Coimbatore": {
      luxury:   ["Vivanta Coimbatore","The Residency Towers","Le Meridien Coimbatore","Sheraton Grand Chola","Taj Coimbatore","Heritance Coimbatore"],
      business: ["Le Meridien Coimbatore","The Residency Towers","Courtyard by Marriott","Vivanta Coimbatore","FCC Lakshmi Mahal","Hotel Le Royal Park"],
      default:  ["Vivanta Coimbatore","The Residency Towers","Le Meridien Coimbatore","Taj Coimbatore","Sheraton Grand Chola","FCC Lakshmi Mahal"],
    },
    "Madurai": {
      luxury:   ["Heritance Madurai","Gateway Hotel Pasumalai","Hotel Sangam Madurai","Taj Gateway Madurai","Royal Court Madurai","Madurai Residency"],
      business: ["Gateway Hotel Pasumalai","Hotel Sangam Madurai","Royal Court Madurai","Hotel Madurai Park","Courtyard Madurai","Hotel Supreme Madurai"],
      default:  ["Heritance Madurai","Gateway Hotel Pasumalai","Hotel Sangam Madurai","Royal Court Madurai","Taj Gateway Madurai","Madurai Residency"],
    },
  };

  const personaKey = ["luxury","business","leisure","adventure","family","food","eco","arts","sports"].includes(persona)
    ? (["luxury","business","leisure"].includes(persona) ? persona : "default")
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