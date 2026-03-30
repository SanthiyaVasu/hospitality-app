// NLP Analysis Engine
// Scores guest text across all persona dimensions

const KEYWORDS = {
  luxury: ["luxury","premium","suite","spa","vip","exclusive","rooftop","penthouse","champagne","butler","concierge","5-star","fine dining","michelin","resort","yacht","first class","bespoke","lavish","opulent"],
  business: ["business","conference","meeting","corporate","work","professional","entrepreneur","startup","executive","ceo","manager","networking","deal","office","presentation","client","b2b","investment","strategy","finance"],
  leisure: ["vacation","holiday","relax","leisure","travel","explore","trip","sightseeing","tourist","beach","pool","sunset","culture","museum","art","history","local","photography","adventure","wanderlust"],
  adventure: ["adventure","hiking","trekking","camping","climbing","diving","surfing","extreme","outdoor","wildlife","safari","mountain","kayaking","rafting","bungee","paragliding","backpacking","trail","expedition"],
  family: ["family","kids","children","parents","baby","toddler","school","playground","disney","theme park","vacation","reunion","celebration","birthday","anniversary","relatives","grandparents","siblings"],
  food: ["food","restaurant","chef","cuisine","cooking","recipe","foodie","gourmet","street food","eat","coffee","wine","beer","cocktail","brunch","breakfast","dessert","vegan","organic","farm-to-table"],
  tech: ["technology","coding","developer","software","ai","machine learning","data","python","javascript","startup","hackathon","innovation","app","digital","engineer","tech","programming","cloud","cybersecurity"],
  eco: ["sustainable","eco","green","nature","environment","organic","carbon","solar","renewable","wildlife","conservation","vegan","plant-based","recycling","climate","biodiversity","ethical","zero waste"],
  arts: ["art","music","gallery","museum","theater","cinema","dance","design","architecture","painting","photography","sculpture","creative","film","concert","opera","exhibition","culture","literature","poetry"],
  sports: ["sports","fitness","gym","running","cycling","swimming","football","cricket","tennis","basketball","yoga","marathon","workout","athlete","training","match","game","league","tournament","championship"],
};

const ROOM_MAP = {
  luxury: "Presidential Suite or Luxury Penthouse",
  business: "Executive Business Room with work desk and high-speed WiFi",
  leisure: "Deluxe Room with city or garden view",
  adventure: "Standard Room with outdoor equipment storage",
  family: "Family Suite with extra beds and kid amenities",
  food: "Room near restaurant floor with dining privileges",
  tech: "Smart Room with full tech setup and high-speed internet",
  eco: "Eco-Friendly Green Room with sustainable amenities",
  arts: "Art Deco Suite with cultural decor",
  sports: "Sports Suite with gym access and recovery amenities",
};

const OFFER_MAP = {
  luxury: "Complimentary champagne on arrival, spa voucher, and private butler",
  business: "Express check-in, meeting room access, and airport transfer",
  leisure: "Free city tour package, late checkout, and welcome drink",
  adventure: "Complimentary trekking gear rental and adventure activity voucher",
  family: "Kids meal free, babysitting service, and family excursion package",
  food: "Chef's tasting menu experience and cooking class invitation",
  tech: "Premium WiFi, tech lounge access, and early access to hotel app",
  eco: "Tree plantation activity, organic breakfast, and eco-tour package",
  arts: "Museum pass, gallery tour, and cultural evening event tickets",
  sports: "Gym access, sports court booking, and nutrition consultation",
};

function analyzeText(textArray) {
  const combined = textArray.join(" ").toLowerCase();
  const scores = {};

  for (const [category, words] of Object.entries(KEYWORDS)) {
    let score = 0;
    for (const word of words) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = combined.match(regex);
      if (matches) score += matches.length;
    }
    scores[category] = score;
  }

  // Normalize scores 0-100
  const maxScore = Math.max(...Object.values(scores), 1);
  const normalized = {};
  for (const [k, v] of Object.entries(scores)) {
    normalized[k] = Math.round((v / maxScore) * 100);
  }

  // Find top persona
  const topPersona = Object.entries(normalized).sort((a, b) => b[1] - a[1])[0][0];

  // Sentiment (simple positive/negative word count)
  const positiveWords = ["great","excellent","amazing","wonderful","love","enjoy","happy","good","fantastic","perfect","best","nice"];
  const negativeWords = ["bad","terrible","awful","hate","dislike","worst","poor","disappointing","horrible","negative"];
  let sentiment = 0;
  for (const w of positiveWords) if (combined.includes(w)) sentiment += 5;
  for (const w of negativeWords) if (combined.includes(w)) sentiment -= 5;
  const sentimentScore = Math.min(100, Math.max(0, 50 + sentiment));

  // Keywords detected
  const detectedKeywords = [];
  for (const words of Object.values(KEYWORDS)) {
    for (const word of words) {
      if (combined.includes(word) && !detectedKeywords.includes(word)) {
        detectedKeywords.push(word);
      }
    }
  }

  return {
    scores: normalized,
    persona: topPersona.charAt(0).toUpperCase() + topPersona.slice(1) + " Traveler",
    personaKey: topPersona,
    sentimentScore,
    keywords: detectedKeywords.slice(0, 20),
    roomRecommendation: ROOM_MAP[topPersona],
    personalizedOffer: OFFER_MAP[topPersona],
    staffNote: `Guest shows strong ${topPersona} profile. Prioritize ${topPersona}-related amenities and services.`,
    dataQuality: textArray.join("").length > 200 ? "High" : textArray.join("").length > 50 ? "Medium" : "Low",
    snippetsCount: textArray.length,
  };
}

module.exports = { analyzeText };