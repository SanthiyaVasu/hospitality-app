// NLP Analysis Engine — Metadata-Aware with Fixed Persona Scoring

const KEYWORDS = {
  luxury:    ["luxury","premium","suite","spa","vip","exclusive","rooftop","penthouse",
              "champagne","butler","concierge","5-star","fine dining","michelin","resort",
              "yacht","first class","bespoke","lavish","opulent","high-end","elite","private"],
  business:  ["business","conference","meeting","corporate","entrepreneur","startup",
              "executive","ceo","manager","networking","deal","presentation","client",
              "b2b","investment","strategy","finance","pitch","revenue","growth",
              "leadership","founder","co-founder","venture","board","stakeholder"],
  leisure:   ["vacation","holiday","relax","leisure","sightseeing","tourist","beach",
              "pool","sunset","history","local food","photography","wanderlust","getaway",
              "scenic","cruise","island","retreat","explore","tour","cultural trip"],
  adventure: ["adventure","hiking","trekking","camping","climbing","diving","surfing",
              "extreme","outdoor","wildlife","safari","mountain","kayaking","rafting",
              "bungee","paragliding","backpacking","trail","expedition","nature walk"],
  family:    ["family","kids","children","parents","baby","toddler","school","playground",
              "disney","theme park","reunion","celebration","birthday","anniversary",
              "relatives","grandparents","siblings","family trip","family vacation"],
  food:      ["food","restaurant","chef","cuisine","cooking","recipe","foodie","gourmet",
              "street food","coffee","wine","cocktail","brunch","dessert","vegan",
              "organic","farm-to-table","michelin star","tasting menu","culinary"],
  tech:      ["tech enthusiast","gadget lover","smart home","wearable tech","ar vr",
              "metaverse","crypto investor","nft collector","tech blogger",
              "silicon valley lifestyle","product hunt","ycombinator"],
  eco:       ["sustainable","eco-friendly","green travel","environment","organic lifestyle",
              "carbon footprint","solar","renewable","wildlife conservation","vegan lifestyle",
              "plant-based","recycling","climate action","zero waste","ethical travel"],
  arts:      ["art lover","gallery visit","museum visit","theater","cinema","dance",
              "architecture tour","painting","photography hobby","sculpture","creative",
              "film festival","concert","opera","exhibition","cultural","literature","poetry"],
  sports:    ["sports","fitness","gym","running","cycling","swimming","football","cricket",
              "tennis","basketball","yoga","marathon","workout","athlete","training",
              "sports match","league","tournament","championship"],
};

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

// ── AD RECOMMENDATION ENGINE ─────────────────────────────────
const AD_CATEGORIES = {
  luxury: [
    { id:"lux1", type:"Room Upgrade",    title:"Presidential Suite Experience",     desc:"Exclusive penthouse with panoramic views, private butler and premium amenities.", tag:"Premium Stay"   },
    { id:"lux2", type:"Luxury Dining",   title:"Fine Dining at Rooftop Restaurant", desc:"Michelin-inspired tasting menu with sommelier-curated wine pairing.",             tag:"Gourmet"        },
    { id:"lux3", type:"Luxury Brand",    title:"In-Hotel Luxury Shopping",          desc:"Exclusive access to curated luxury brands — jewellery, fashion, and accessories.", tag:"Lifestyle"      },
  ],
  business: [
    { id:"biz1", type:"Room Upgrade",    title:"Executive Club Room",               desc:"Dedicated work desk, high-speed WiFi, lounge access and express check-in.",        tag:"Business Stay"  },
    { id:"biz2", type:"Dining",          title:"Business Breakfast Package",        desc:"Power breakfast with meeting room access and complimentary airport transfer.",      tag:"Corporate"      },
    { id:"biz3", type:"Service",         title:"Concierge Business Services",       desc:"Secretarial support, courier service, and co-working lounge access.",              tag:"Productivity"   },
  ],
  leisure: [
    { id:"lei1", type:"Travel Activity", title:"City Heritage Tour Package",        desc:"Guided half-day tour covering top cultural landmarks and local experiences.",       tag:"Explore"        },
    { id:"lei2", type:"Dining",          title:"Local Cuisine Food Walk",           desc:"Curated street food and restaurant experience with a local food expert.",          tag:"Food & Culture" },
    { id:"lei3", type:"Wellness",        title:"Spa & Relaxation Day Package",      desc:"Full-day spa access with massage, pool, and wellness consultation.",               tag:"Relaxation"     },
  ],
  adventure: [
    { id:"adv1", type:"Travel Activity", title:"Adventure Sports Package",          desc:"Trekking, rock climbing, or water sports — curated outdoor experiences nearby.",   tag:"Adventure"      },
    { id:"adv2", type:"Travel Activity", title:"Wildlife Safari Day Trip",          desc:"Guided wildlife safari with expert naturalist and photography stops.",              tag:"Nature"         },
    { id:"adv3", type:"Room Package",    title:"Explorer Base Camp Room",           desc:"Gear storage, trail maps, early breakfast and packed lunch for day trips.",        tag:"Outdoor Stay"   },
  ],
  family: [
    { id:"fam1", type:"Room Upgrade",    title:"Family Suite with Kids Amenities",  desc:"Interconnected rooms with kids club access, babysitting and family dining.",       tag:"Family Stay"    },
    { id:"fam2", type:"Activity",        title:"Family Fun Day Package",            desc:"Theme park tickets, kids meal free, and family photo session included.",           tag:"Kids & Family"  },
    { id:"fam3", type:"Dining",          title:"Family Dining Special",             desc:"Children eat free, custom kids menu, and birthday cake arrangement available.",    tag:"Family Dining"  },
  ],
  food: [
    { id:"foo1", type:"Dining",          title:"Chef's Table Experience",           desc:"Exclusive 7-course tasting menu prepared by executive chef, table-side service.", tag:"Gourmet"        },
    { id:"foo2", type:"Activity",        title:"Cooking Masterclass",               desc:"Hands-on cooking class with hotel chef — learn local and international cuisine.",  tag:"Culinary"       },
    { id:"foo3", type:"Dining",          title:"Weekend Brunch Buffet",             desc:"Premium weekend brunch with live counters, cocktails and dessert bar.",            tag:"Brunch"         },
  ],
  eco: [
    { id:"eco1", type:"Room Package",    title:"Eco-Friendly Green Room",           desc:"Solar-powered room with organic toiletries, bamboo furnishings, zero waste.",      tag:"Sustainable"    },
    { id:"eco2", type:"Activity",        title:"Tree Plantation Experience",        desc:"Join our green initiative — plant a tree and receive a certificate.",             tag:"Green"          },
    { id:"eco3", type:"Dining",          title:"Farm-to-Table Organic Dining",      desc:"100% organic, locally sourced menu with seasonal vegetarian specialties.",        tag:"Organic"        },
  ],
  arts: [
    { id:"art1", type:"Activity",        title:"Cultural Evening & Art Walk",       desc:"Curated art gallery tour followed by live cultural performance and dinner.",       tag:"Culture"        },
    { id:"art2", type:"Activity",        title:"Museum Pass & Heritage Tour",       desc:"Skip-the-line passes to top museums and guided heritage walk.",                   tag:"Heritage"       },
    { id:"art3", type:"Room Package",    title:"Art Deco Suite Experience",         desc:"Culturally themed suite with local art pieces, poetry collection and craft gifts.", tag:"Art Stay"      },
  ],
  sports: [
    { id:"spo1", type:"Wellness",        title:"Premium Gym & Fitness Access",      desc:"Full gym, personal trainer session, nutrition consultation and recovery suite.",   tag:"Fitness"        },
    { id:"spo2", type:"Activity",        title:"Sports Court Booking Package",      desc:"Tennis, badminton or squash court with equipment rental and coach.",              tag:"Sports"         },
    { id:"spo3", type:"Dining",          title:"Athlete Nutrition Meal Plan",       desc:"High-protein, custom meal plan designed by in-house nutritionist.",               tag:"Nutrition"      },
  ],
};

const IMAGE_PROMPTS = {
  lux1: "luxury hotel presidential suite panoramic city view elegant interior golden lighting professional advertisement",
  lux2: "luxury rooftop restaurant fine dining candlelight michelin star food elegant ambiance professional ad",
  lux3: "luxury hotel boutique shopping lounge designer brands elegant display professional advertisement",
  biz1: "executive hotel business room modern work desk city view professional corporate advertisement",
  biz2: "business hotel breakfast meeting room professional corporate elegant morning ad",
  biz3: "hotel concierge business services professional corporate lounge elegant advertisement",
  lei1: "city heritage cultural tour sightseeing landmark beautiful travel advertisement professional",
  lei2: "local street food walking tour colorful market cuisine travel experience advertisement",
  lei3: "luxury hotel spa relaxation pool wellness serene calm professional advertisement",
  adv1: "adventure sports outdoor trekking mountain nature exciting travel advertisement professional",
  adv2: "wildlife safari nature photography animals landscape travel adventure advertisement",
  adv3: "outdoor adventure hotel base camp gear equipment nature trail advertisement",
  fam1: "family hotel suite kids amenities fun colorful family vacation advertisement professional",
  fam2: "family fun day theme park kids happy vacation travel advertisement colorful",
  fam3: "family restaurant dining kids menu colorful happy family meal advertisement",
  foo1: "chef table fine dining gourmet experience exclusive restaurant elegant food advertisement",
  foo2: "cooking masterclass hotel chef kitchen hands-on culinary experience advertisement",
  foo3: "hotel brunch buffet weekend spread colorful food spread professional advertisement",
  eco1: "eco friendly green hotel room sustainable bamboo natural organic advertisement",
  eco2: "tree plantation green hotel nature environment sustainability advertisement",
  eco3: "farm to table organic restaurant fresh vegetables natural food advertisement",
  art1: "art gallery cultural evening exhibition paintings elegant professional advertisement",
  art2: "museum heritage tour architecture cultural landmark professional travel advertisement",
  art3: "art deco hotel suite cultural decor painting elegant artistic advertisement",
  spo1: "hotel gym fitness premium workout equipment professional wellness advertisement",
  spo2: "hotel sports court tennis badminton active lifestyle professional advertisement",
  spo3: "athlete nutrition healthy meal plan protein food professional hotel advertisement",
};

function generateAdRecommendations(scores, metadata) {
  const { spendingLevel, seniority, lifestyle = [], ageRange } = metadata || {};

  const topPersonas = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key);

  const ads = [];
  for (const persona of topPersonas) {
    const personaAds = AD_CATEGORIES[persona] || [];
    ads.push(...personaAds.slice(0, 2));
  }

  if ((spendingLevel === "High" || seniority === "C-Suite") && !ads.find(a => a.id === "lux1"))
    ads.unshift(AD_CATEGORIES.luxury[0]);
  if ((ageRange === "18-24" || ageRange === "25-34") && !ads.find(a => a.id === "adv1"))
    ads.push(AD_CATEGORIES.adventure[0]);
  if ((ageRange === "45-54" || ageRange === "55+") && !ads.find(a => a.id === "lei3"))
    ads.push(AD_CATEGORIES.leisure[2]);
  if (lifestyle.includes("Foodie")           && !ads.find(a => a.id === "foo1")) ads.push(AD_CATEGORIES.food[0]);
  if (lifestyle.includes("Health Conscious") && !ads.find(a => a.id === "spo1")) ads.push(AD_CATEGORIES.sports[0]);
  if (lifestyle.includes("Luxury Lifestyle") && !ads.find(a => a.id === "lux1")) ads.unshift(AD_CATEGORIES.luxury[0]);

  const unique = [];
  const seen   = new Set();
  for (const ad of ads) {
    if (!seen.has(ad.id)) { seen.add(ad.id); unique.push(ad); }
    if (unique.length >= 6) break;
  }

  return unique.map(ad => ({
    ...ad,
    imageUrl: "https://image.pollinations.ai/prompt/" +
      encodeURIComponent(IMAGE_PROMPTS[ad.id] || "luxury hotel professional advertisement") +
      "?width=600&height=400&nologo=true&seed=" + ad.id.charCodeAt(0),
  }));
}

// ── Metadata-aware room upgrade logic ────────────────────────
function getMetadataBasedRoom(metadata, basePersona) {
  if (!metadata) return ROOM_MAP[basePersona];
  const { spendingLevel, seniority, ageRange, travelFrequency } = metadata;
  if (seniority === "C-Suite" || spendingLevel === "High")
    return "Presidential Suite or Executive Penthouse with personal butler";
  if (seniority === "Senior Executive" && travelFrequency === "Frequent")
    return "Executive Club Room with lounge access and express services";
  if (ageRange === "18-24" && spendingLevel === "Budget")
    return "Comfortable Standard Room with social spaces and co-working zone";
  if (basePersona === "family" || ageRange === "45-54" || ageRange === "55+")
    return "Deluxe Family Suite with quiet floor and accessibility features";
  return ROOM_MAP[basePersona];
}

// ── Metadata-aware offer logic ────────────────────────────────
function getMetadataBasedOffer(metadata, basePersona) {
  if (!metadata) return OFFER_MAP[basePersona];
  const { spendingLevel, seniority, lifestyle = [], ageRange } = metadata;
  const parts = [];
  if (spendingLevel === "High" || seniority === "C-Suite") {
    parts.push("Complimentary champagne & premium welcome basket");
    parts.push("Dedicated concierge for entire stay");
  } else if (spendingLevel === "Budget") {
    parts.push("Complimentary breakfast for 2");
    parts.push("Free city map and local tips guide");
  } else {
    parts.push(OFFER_MAP[basePersona]);
  }
  if (lifestyle.includes("Frequent Traveler"))  parts.push("Priority check-in & loyalty points bonus");
  if (lifestyle.includes("Foodie"))             parts.push("Chef's table reservation with 20% dining discount");
  if (lifestyle.includes("Health Conscious"))   parts.push("Complimentary spa access & wellness consultation");
  if (lifestyle.includes("Tech Enthusiast"))    parts.push("Premium high-speed WiFi & smart room controls");
  if (lifestyle.includes("Social Influencer"))  parts.push("Complimentary photo-ready suite upgrade");
  if (ageRange === "55+")                       parts.push("Senior comfort amenities & quiet room guarantee");
  if (ageRange === "18-24")                     parts.push("Social events access & local experience voucher");
  return parts.slice(0, 3).join(" | ");
}

// ── Staff note ────────────────────────────────────────────────
function getStaffNote(metadata, basePersona) {
  if (!metadata)
    return "Guest shows strong " + basePersona + " profile. Prioritize " + basePersona + "-related amenities.";
  const { age, ageRange, salary, location, seniority, profession, spendingLevel, travelFrequency, lifestyle = [] } = metadata;
  const notes = [];
  notes.push("Guest persona: " + basePersona.charAt(0).toUpperCase() + basePersona.slice(1) + " Traveler.");
  if (seniority && seniority !== "Unknown")   notes.push("Seniority: " + seniority + " (" + profession + ").");
  if (ageRange  && ageRange  !== "Unknown")   notes.push("Age group: " + ageRange + (age ? " (~" + age + " yrs)" : "") + ".");
  if (salary    && salary    !== "Unknown")   notes.push("Income estimate: " + salary + ".");
  if (location  && location  !== "Unknown")   notes.push("Location: " + location + ".");
  if (spendingLevel)                          notes.push("Spending: " + spendingLevel + ".");
  if (travelFrequency)                        notes.push("Travel frequency: " + travelFrequency + ".");
  if (lifestyle.length > 0)                   notes.push("Lifestyle: " + lifestyle.slice(0, 3).join(", ") + ".");
  notes.push("Priority: " + (spendingLevel === "High" ? "luxury and personalized" : spendingLevel === "Budget" ? "value-for-money" : "comfort and quality") + " services.");
  return notes.join(" ");
}

// ── MAIN ANALYSIS FUNCTION ────────────────────────────────────
function analyzeText(textArray, metadata = null) {
  const combined = textArray.join(" ").toLowerCase();
  const scores   = {};

  for (const [category, words] of Object.entries(KEYWORDS)) {
    let score = 0;
    for (const word of words) {
      const regex   = new RegExp("\\b" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
      const matches = combined.match(regex);
      if (matches) score += matches.length;
    }
    scores[category] = score;
  }

  if (metadata) {
    const { seniority, spendingLevel, profession, lifestyle = [] } = metadata;

    if (profession) {
      const prof = profession.toLowerCase();
      if (prof.includes("ceo") || prof.includes("founder") || prof.includes("c-suite")) {
        scores.business = (scores.business || 0) + 40;
        scores.luxury   = (scores.luxury   || 0) + 30;
      } else if (prof.includes("vp") || prof.includes("director") || prof.includes("executive")) {
        scores.business = (scores.business || 0) + 30;
        scores.luxury   = (scores.luxury   || 0) + 20;
      } else if (prof.includes("manager") || prof.includes("lead")) {
        scores.business = (scores.business || 0) + 25;
      } else if (prof.includes("software") || prof.includes("developer")) {
        scores.business = (scores.business || 0) + 15;
      } else if (prof.includes("doctor") || prof.includes("physician")) {
        scores.luxury   = (scores.luxury   || 0) + 20;
      }
    }

    if (seniority === "C-Suite") {
      scores.luxury   = (scores.luxury   || 0) + 25;
      scores.business = (scores.business || 0) + 20;
    }
    if (seniority === "Senior Executive") {
      scores.luxury   = (scores.luxury   || 0) + 15;
      scores.business = (scores.business || 0) + 15;
    }
    if (seniority === "Senior")     scores.business = (scores.business || 0) + 12;
    if (seniority === "Mid-Senior") scores.business = (scores.business || 0) + 8;
    if (spendingLevel === "High")   scores.luxury   = (scores.luxury   || 0) + 20;
    if (spendingLevel === "Budget") scores.leisure  = (scores.leisure  || 0) + 10;

    if (lifestyle.includes("Frequent Traveler"))  scores.leisure   = (scores.leisure   || 0) + 15;
    if (lifestyle.includes("Luxury Lifestyle"))   scores.luxury    = (scores.luxury    || 0) + 20;
    if (lifestyle.includes("Entrepreneur"))       scores.business  = (scores.business  || 0) + 15;
    if (lifestyle.includes("Outdoor Adventurer")) scores.adventure = (scores.adventure || 0) + 15;
    if (lifestyle.includes("Foodie"))             scores.food      = (scores.food      || 0) + 15;
    if (lifestyle.includes("Health Conscious"))   scores.sports    = (scores.sports    || 0) + 12;
    if (lifestyle.includes("Culture Enthusiast")) scores.arts      = (scores.arts      || 0) + 12;
    if (lifestyle.includes("Family Oriented"))    scores.family    = (scores.family    || 0) + 15;
    if (lifestyle.includes("Social Influencer"))  scores.leisure   = (scores.leisure   || 0) + 10;

    if (!lifestyle.includes("Tech Enthusiast")) scores.tech = Math.min(scores.tech || 0, 3);
  }

  const maxScore   = Math.max(...Object.values(scores), 1);
  const normalized = {};
  for (const [k, v] of Object.entries(scores)) {
    normalized[k] = Math.round((v / maxScore) * 100);
  }

  const topPersona = Object.entries(normalized).sort((a, b) => b[1] - a[1])[0][0];

  const positiveWords = ["great","excellent","amazing","wonderful","love","enjoy","happy","good","fantastic","perfect","best","nice"];
  const negativeWords  = ["bad","terrible","awful","hate","dislike","worst","poor","disappointing","horrible","negative"];
  let sentiment = 0;
  for (const w of positiveWords) if (combined.includes(w)) sentiment += 5;
  for (const w of negativeWords)  if (combined.includes(w)) sentiment -= 5;
  const sentimentScore = Math.min(100, Math.max(0, 50 + sentiment));

  const detectedKeywords = [];
  for (const words of Object.values(KEYWORDS)) {
    for (const word of words) {
      if (combined.includes(word) && !detectedKeywords.includes(word)) detectedKeywords.push(word);
    }
  }

  console.log("Persona scores:", JSON.stringify(normalized));
  console.log("Top persona:", topPersona);

  return {
    scores:             normalized,
    persona:            topPersona.charAt(0).toUpperCase() + topPersona.slice(1) + " Traveler",
    personaKey:         topPersona,
    sentimentScore,
    keywords:           detectedKeywords.slice(0, 20),
    roomRecommendation: getMetadataBasedRoom(metadata, topPersona),
    personalizedOffer:  getMetadataBasedOffer(metadata, topPersona),
    staffNote:          getStaffNote(metadata, topPersona),
    adRecommendations:  generateAdRecommendations(normalized, metadata),
    dataQuality:        textArray.join("").length > 200 ? "High" : textArray.join("").length > 50 ? "Medium" : "Low",
    snippetsCount:      textArray.length,
    metadata,
  };
}

module.exports = { analyzeText };