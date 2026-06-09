// NLP Analysis Engine — Enhanced with Metadata-Aware Recommendations

const KEYWORDS = {
  luxury:    ["luxury","premium","suite","spa","vip","exclusive","rooftop","penthouse","champagne","butler","concierge","5-star","fine dining","michelin","resort","yacht","first class","bespoke","lavish","opulent"],
  business:  ["business","conference","meeting","corporate","work","professional","entrepreneur","startup","executive","ceo","manager","networking","deal","office","presentation","client","b2b","investment","strategy","finance"],
  leisure:   ["vacation","holiday","relax","leisure","travel","explore","trip","sightseeing","tourist","beach","pool","sunset","culture","museum","art","history","local","photography","adventure","wanderlust"],
  adventure: ["adventure","hiking","trekking","camping","climbing","diving","surfing","extreme","outdoor","wildlife","safari","mountain","kayaking","rafting","bungee","paragliding","backpacking","trail","expedition"],
  family:    ["family","kids","children","parents","baby","toddler","school","playground","disney","theme park","vacation","reunion","celebration","birthday","anniversary","relatives","grandparents","siblings"],
  food:      ["food","restaurant","chef","cuisine","cooking","recipe","foodie","gourmet","street food","eat","coffee","wine","beer","cocktail","brunch","breakfast","dessert","vegan","organic","farm-to-table"],
  tech:      ["technology","coding","developer","software","ai","machine learning","data","python","javascript","startup","hackathon","innovation","app","digital","engineer","tech","programming","cloud","cybersecurity"],
  eco:       ["sustainable","eco","green","nature","environment","organic","carbon","solar","renewable","wildlife","conservation","vegan","plant-based","recycling","climate","biodiversity","ethical","zero waste"],
  arts:      ["art","music","gallery","museum","theater","cinema","dance","design","architecture","painting","photography","sculpture","creative","film","concert","opera","exhibition","culture","literature","poetry"],
  sports:    ["sports","fitness","gym","running","cycling","swimming","football","cricket","tennis","basketball","yoga","marathon","workout","athlete","training","match","game","league","tournament","championship"],
};

// ── Room recommendations by persona ─────────────────────────
const ROOM_MAP = {
  luxury:    "Presidential Suite or Luxury Penthouse",
  business:  "Executive Business Room with work desk and high-speed WiFi",
  leisure:   "Deluxe Room with city or garden view",
  adventure: "Standard Room with outdoor equipment storage",
  family:    "Family Suite with extra beds and kid amenities",
  food:      "Room near restaurant floor with dining privileges",
  tech:      "Smart Room with full tech setup and high-speed internet",
  eco:       "Eco-Friendly Green Room with sustainable amenities",
  arts:      "Art Deco Suite with cultural decor",
  sports:    "Sports Suite with gym access and recovery amenities",
};

const OFFER_MAP = {
  luxury:    "Complimentary champagne on arrival, spa voucher, and private butler",
  business:  "Express check-in, meeting room access, and airport transfer",
  leisure:   "Free city tour package, late checkout, and welcome drink",
  adventure: "Complimentary trekking gear rental and adventure activity voucher",
  family:    "Kids meal free, babysitting service, and family excursion package",
  food:      "Chef's tasting menu experience and cooking class invitation",
  tech:      "Premium WiFi, tech lounge access, and early access to hotel app",
  eco:       "Tree plantation activity, organic breakfast, and eco-tour package",
  arts:      "Museum pass, gallery tour, and cultural evening event tickets",
  sports:    "Gym access, sports court booking, and nutrition consultation",
};

// ── Metadata-aware room upgrade logic ───────────────────────
function getMetadataBasedRoom(metadata, basePersona) {
  if (!metadata) return ROOM_MAP[basePersona];

  const { spendingLevel, seniority, ageRange, travelFrequency } = metadata;

  // C-Suite / Very High Spending → always upgrade to suite
  if (seniority === "C-Suite" || spendingLevel === "High") {
    return "Presidential Suite or Executive Penthouse with personal butler";
  }

  // Senior Executive + frequent traveler
  if (seniority === "Senior Executive" && travelFrequency === "Frequent") {
    return "Executive Club Room with lounge access and express services";
  }

  // Young guest (18-24) + budget
  if (ageRange === "18-24" && spendingLevel === "Budget") {
    return "Comfortable Standard Room with social spaces and co-working zone";
  }

  // Family + older guest (45-54 / 55+)
  if (basePersona === "family" || (ageRange === "45-54" || ageRange === "55+")) {
    return "Deluxe Family Suite with quiet floor and accessibility features";
  }

  return ROOM_MAP[basePersona];
}

// ── Metadata-aware offer logic ───────────────────────────────
function getMetadataBasedOffer(metadata, basePersona) {
  if (!metadata) return OFFER_MAP[basePersona];

  const { spendingLevel, seniority, lifestyle = [], travelFrequency, ageRange } = metadata;

  const parts = [];

  // Spending level based add-ons
  if (spendingLevel === "High" || seniority === "C-Suite") {
    parts.push("Complimentary champagne & premium welcome basket");
    parts.push("Dedicated concierge for entire stay");
  } else if (spendingLevel === "Budget") {
    parts.push("Complimentary breakfast for 2");
    parts.push("Free city map and local tips guide");
  } else {
    parts.push(OFFER_MAP[basePersona]);
  }

  // Lifestyle add-ons
  if (lifestyle.includes("Frequent Traveler")) parts.push("Priority check-in & loyalty points bonus");
  if (lifestyle.includes("Foodie")) parts.push("Chef's table reservation with 20% dining discount");
  if (lifestyle.includes("Health Conscious")) parts.push("Complimentary spa access & wellness consultation");
  if (lifestyle.includes("Tech Enthusiast")) parts.push("Premium high-speed WiFi & smart room controls");
  if (lifestyle.includes("Social Influencer")) parts.push("Complimentary photo-ready suite upgrade for content creation");

  // Age-based add-ons
  if (ageRange === "55+") parts.push("Senior comfort amenities & quiet room guarantee");
  if (ageRange === "18-24") parts.push("Social events access & local experience voucher");

  return parts.slice(0, 3).join(" | ");
}

// ── Staff note based on metadata ─────────────────────────────
function getStaffNote(metadata, basePersona, analysis) {
  if (!metadata) {
    return `Guest shows strong ${basePersona} profile. Prioritize ${basePersona}-related amenities and services.`;
  }

  const { age, ageRange, salary, location, seniority, profession, spendingLevel, travelFrequency, lifestyle = [] } = metadata;

  const notes = [];

  notes.push(`Guest persona: ${basePersona.charAt(0).toUpperCase() + basePersona.slice(1)} Traveler.`);

  if (seniority && seniority !== "Unknown") notes.push(`Seniority level: ${seniority} (${profession}).`);
  if (ageRange && ageRange !== "Unknown") notes.push(`Estimated age group: ${ageRange}${age ? ` (~${age} years)` : ""}.`);
  if (salary && salary !== "Unknown") notes.push(`Income estimate: ${salary}.`);
  if (location && location !== "Unknown") notes.push(`Guest location: ${location}.`);
  if (spendingLevel) notes.push(`Spending profile: ${spendingLevel}.`);
  if (travelFrequency) notes.push(`Travel frequency: ${travelFrequency}.`);
  if (lifestyle.length > 0) notes.push(`Lifestyle signals: ${lifestyle.slice(0, 3).join(", ")}.`);

  notes.push(`Priority: Focus on ${spendingLevel === "High" ? "luxury and personalized" : spendingLevel === "Budget" ? "value-for-money" : "comfort and quality"} services.`);

  return notes.join(" ");
}

// ── MAIN ANALYSIS FUNCTION ───────────────────────────────────
function analyzeText(textArray, metadata = null) {
  const combined = textArray.join(" ").toLowerCase();
  const scores   = {};

  for (const [category, words] of Object.entries(KEYWORDS)) {
    let score = 0;
    for (const word of words) {
      const regex   = new RegExp(`\\b${word}\\b`, "gi");
      const matches = combined.match(regex);
      if (matches) score += matches.length;
    }
    scores[category] = score;
  }

  // Boost scores based on metadata signals
  if (metadata) {
    const { seniority, spendingLevel, lifestyle = [] } = metadata;
    if (seniority === "C-Suite" || spendingLevel === "High") scores.luxury = (scores.luxury || 0) + 10;
    if (seniority === "Mid-Senior" || seniority === "Senior") scores.business = (scores.business || 0) + 8;
    if (lifestyle.includes("Frequent Traveler")) scores.leisure = (scores.leisure || 0) + 6;
    if (lifestyle.includes("Outdoor Adventurer")) scores.adventure = (scores.adventure || 0) + 6;
    if (lifestyle.includes("Foodie")) scores.food = (scores.food || 0) + 6;
    if (lifestyle.includes("Tech Enthusiast")) scores.tech = (scores.tech || 0) + 6;
    if (lifestyle.includes("Health Conscious")) scores.sports = (scores.sports || 0) + 5;
    if (lifestyle.includes("Culture Enthusiast")) scores.arts = (scores.arts || 0) + 5;
    if (lifestyle.includes("Family Oriented")) scores.family = (scores.family || 0) + 6;
  }

  // Normalize 0-100
  const maxScore   = Math.max(...Object.values(scores), 1);
  const normalized = {};
  for (const [k, v] of Object.entries(scores)) {
    normalized[k] = Math.round((v / maxScore) * 100);
  }

  const topPersona = Object.entries(normalized).sort((a, b) => b[1] - a[1])[0][0];

  // Sentiment
  const positiveWords = ["great","excellent","amazing","wonderful","love","enjoy","happy","good","fantastic","perfect","best","nice"];
  const negativeWords  = ["bad","terrible","awful","hate","dislike","worst","poor","disappointing","horrible","negative"];
  let sentiment = 0;
  for (const w of positiveWords) if (combined.includes(w)) sentiment += 5;
  for (const w of negativeWords)  if (combined.includes(w)) sentiment -= 5;
  const sentimentScore = Math.min(100, Math.max(0, 50 + sentiment));

  // Keywords
  const detectedKeywords = [];
  for (const words of Object.values(KEYWORDS)) {
    for (const word of words) {
      if (combined.includes(word) && !detectedKeywords.includes(word)) {
        detectedKeywords.push(word);
      }
    }
  }

  return {
    scores:              normalized,
    persona:             topPersona.charAt(0).toUpperCase() + topPersona.slice(1) + " Traveler",
    personaKey:          topPersona,
    sentimentScore,
    keywords:            detectedKeywords.slice(0, 20),
    roomRecommendation:  getMetadataBasedRoom(metadata, topPersona),
    personalizedOffer:   getMetadataBasedOffer(metadata, topPersona),
    staffNote:           getStaffNote(metadata, topPersona, normalized),
    dataQuality:         textArray.join("").length > 200 ? "High" : textArray.join("").length > 50 ? "Medium" : "Low",
    snippetsCount:       textArray.length,
    // metadata passed through for frontend display
    metadata,
  };
}

module.exports = { analyzeText };
