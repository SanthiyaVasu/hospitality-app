const axios = require("axios");
require("dotenv").config();

const SERPAPI_KEY    = process.env.SERPAPI_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID  = process.env.GOOGLE_CSE_ID;
const HUNTER_API_KEY = process.env.HUNTER_API_KEY;
const PDL_API_KEY    = process.env.PDL_API_KEY;

// ── HUNTER.IO ────────────────────────────────────────────────
async function hunterLookup(email) {
  if (!HUNTER_API_KEY) return null;
  const domain = email.split("@")[1] || "";
  let jobTitle = null, company = null, fullName = null;
  let linkedin = null, twitter = null, emailStatus = null;

  try {
    const res = await axios.get("https://api.hunter.io/v2/email-verifier", {
      params: { email, api_key: HUNTER_API_KEY },
      timeout: 8000,
    });
    emailStatus = res.data?.data?.status || null;
    console.log("✅ Hunter verified:", email, "→", emailStatus);
  } catch (err) {
    console.log("⚠️ Hunter verify error:", err.message);
  }

  try {
    const res = await axios.get("https://api.hunter.io/v2/domain-search", {
      params: { domain, api_key: HUNTER_API_KEY, limit: 10 },
      timeout: 8000,
    });
    const data   = res.data?.data;
    company      = data?.organization || null;
    const emails = data?.emails || [];
    console.log("Hunter domain-search emails found:", JSON.stringify(emails.map(e => ({ value: e.value, position: e.position })), null, 2));

    const match  = emails.find(e => e.value?.toLowerCase() === email.toLowerCase());
    if (match) {
      console.log("Hunter exact email match object:", JSON.stringify(match, null, 2));
      fullName = `${match.first_name || ""} ${match.last_name || ""}`.trim() || null;
      jobTitle = match.position || null;
      linkedin = match.linkedin || null;
      twitter  = match.twitter  || null;
      console.log("✅ Hunter domain match:", fullName, "|", jobTitle, "at", company);
    } else {
      console.log("⚠️ Hunter: no exact email match found in domain-search results for", email);
    }
  } catch (err) {
    console.log("⚠️ Hunter domain error:", err.message);
  }

  if (!emailStatus && !company && !jobTitle) return null;
  return { fullName, jobTitle, company, linkedin, twitter, emailStatus, source: "Hunter.io" };
}

// ── PEOPLE DATA LABS ─────────────────────────────────────────
async function pdlLookup(email, name) {
  if (!PDL_API_KEY) return null;
  console.log("=== PDL LOOKUP DEBUG for:", email, "===");
  try {
    const res = await axios.get("https://api.peopledatalabs.com/v5/person/enrich", {
      params: { email, pretty: true },
      headers: { "X-Api-Key": PDL_API_KEY },
      timeout: 8000,
    });
    const d = res.data;
    console.log("RAW PDL RESPONSE:", JSON.stringify(d, null, 2));
    if (!d || d.status !== 200) return await pdlSearch(email, name);
    console.log("✅ PDL enrichment found:", d.data?.full_name, d.data?.job_title);
    return parsePDLPerson(d.data || d);
  } catch (err) {
    console.log("⚠️ PDL enrichment error:", err.message);
    return await pdlSearch(email, name);
  }
}

async function pdlSearch(email, name) {
  if (!PDL_API_KEY) return null;
  try {
    const nameParts      = (name || "").split(" ");
    const firstName      = nameParts[0] || "";
    const lastName       = nameParts.slice(1).join(" ") || "";
    const emailDomain    = email.split("@")[1]?.toLowerCase() || "";
    const domainRoot     = emailDomain.split(".")[0];
    const genericDomains = ["gmail.com","yahoo.com","hotmail.com","outlook.com","rediffmail.com","icloud.com"];
    const isGeneric      = genericDomains.includes(emailDomain);
    const commonNames    = ["kumar","raj","sharma","singh","gupta","patel","verma","yadav","mehta","joshi","nair","reddy","iyer"];
    const isCommon       = commonNames.some(n => name.toLowerCase().split(" ").includes(n));

    const res = await axios.post(
      "https://api.peopledatalabs.com/v5/person/search",
      {
        query: {
          bool: {
            should: [
              { match: { emails: email } },
              { bool: { must: [{ match: { first_name: firstName } }, { match: { last_name: lastName } }] } },
            ],
          },
        },
        size: 3,
      },
      { headers: { "X-Api-Key": PDL_API_KEY, "Content-Type": "application/json" }, timeout: 8000 }
    );

    const results = res.data?.data || [];
    if (!results.length) return null;

    let person = results.find(p =>
      (p.emails || []).some(e => {
        const addr = typeof e === "string" ? e : (e?.address || e?.value || "");
        return addr.toLowerCase() === email.toLowerCase();
      })
    );

    let matchType = null;

    if (!person && !isGeneric && domainRoot.length > 2) {
      person = results.find(p =>
        (p.job_company_website || "").toLowerCase().includes(domainRoot) ||
        (p.job_company_name    || "").toLowerCase().includes(domainRoot)
      );
      if (person) matchType = "domain";
    }

    if (!person && !isCommon && !isGeneric) {
      person = results[0];
      matchType = "name-fallback";
    }

    if (!person) {
      console.log("PDL: no reliable match for", email);
      return null;
    }

    console.log("PDL matched via:", matchType, "→", person.full_name, "|", person.job_title, "|", person.job_company_name);

    const parsed = parsePDLPerson(person);

    // Only trust location/age if match was via verified domain — name-fallback matches
    // are too risky for personal fields like location and birth year
    if (matchType !== "domain") {
      parsed.location  = null;
      parsed.country   = null;
      parsed.age       = null;
      parsed.birthYear = null;
      console.log("PDL match was name-fallback only — discarding location/age (too risky)");
    }

    return parsed;
  } catch (err) {
    console.log("⚠️ PDL search error:", err.message);
    return null;
  }
}

function parsePDLPerson(person) {
  const experience = person.experience || [];
  const totalExp   = experience.length > 0
    ? new Date().getFullYear() - new Date(experience[experience.length - 1]?.start_date || "2000-01-01").getFullYear()
    : null;
  return {
    fullName:        person.full_name        || null,
    firstName:       person.first_name       || null,
    lastName:        person.last_name        || null,
    age:             person.birth_year ? new Date().getFullYear() - person.birth_year : null,
    birthYear:       person.birth_year       || null,
    location:        person.location_name    || person.location_locality || null,
    country:         person.location_country || null,
    jobTitle:        person.job_title        || null,
    jobCompany:      person.job_company_name || null,
    jobSeniority:    person.job_title_levels?.[0] || null,
    jobRole:         person.job_title_role   || null,
    industry:        person.industry         || null,
    yearsExperience: totalExp,
    skills:          (person.skills     || []).slice(0, 10).map(s => s.name || s).filter(Boolean),
    education:       (person.education  || []).map(e => e.school?.name).filter(Boolean),
    pastCompanies:   experience.slice(0, 3).map(e => e.company?.name).filter(Boolean),
    linkedin:        person.linkedin_url || null,
    twitter:         person.twitter_url  || null,
    github:          person.github_url   || null,
    source:          "People Data Labs",
  };
}

// ── Build metadata ────────────────────────────────────────────
function buildMetadataFromAPIs(pdlData, hunterData) {
  if (!pdlData && !hunterData) return null;
  const d = pdlData    || {};
  const h = hunterData || {};

  function estimateSalary(seniority, yearsExp) {
    const map = {
      cxo: "₹40+ LPA", vp: "₹30–50 LPA", director: "₹25–40 LPA",
      manager: "₹12–25 LPA", senior: "₹12–22 LPA",
      entry: "₹3–7 LPA", training: "₹2–5 LPA",
    };
    if (seniority && map[seniority.toLowerCase()])
      return { range: map[seniority.toLowerCase()], source: "PDL seniority level" };
    if (yearsExp >= 15) return { range: "₹25–50 LPA", source: "years of experience" };
    if (yearsExp >= 10) return { range: "₹15–30 LPA", source: "years of experience" };
    if (yearsExp >= 5)  return { range: "₹8–18 LPA",  source: "years of experience" };
    if (yearsExp >= 2)  return { range: "₹4–9 LPA",   source: "years of experience" };
    return { range: "₹3–6 LPA", source: "entry level estimate" };
  }

  const salary = estimateSalary(d.jobSeniority, d.yearsExperience);

  return {
    fullName:         d.fullName     || h.fullName     || null,
    age:              d.age          || null,
    birthYear:        d.birthYear    || null,
    ageRange:         d.age
      ? d.age < 25 ? "18–24" : d.age < 35 ? "25–34"
        : d.age < 45 ? "35–44" : d.age < 55 ? "45–54" : "55+"
      : null,
    ageSource:        d.birthYear ? "birth year (People Data Labs)" : null,
    location:         d.location     || null,
    country:          d.country      || null,
    locationSource:   d.location     ? "People Data Labs" : null,
    profession:       d.jobTitle     || h.jobTitle     || null,
    company:          d.jobCompany   || h.company      || null,
    seniority:        d.jobSeniority || null,
    industry:         d.industry     || null,
    jobRole:          d.jobRole      || null,
    yearsExperience:  d.yearsExperience || null,
    pastCompanies:    d.pastCompanies   || [],
    salary:           salary.range,
    salarySource:     salary.source,
    skills:           d.skills       || [],
    education:        d.education    || [],
    linkedinFromAPI:  d.linkedin     || h.linkedin     || null,
    twitterFromAPI:   d.twitter      || h.twitter      || null,
    githubFromAPI:    d.github       || null,
    emailStatus:      h.emailStatus  || null,
    dataSource: [
      pdlData    ? (d.source    || "People Data Labs") : null,
      hunterData ? (h.source    || "Hunter.io")        : null,
    ].filter(Boolean).join(" + "),
  };
}

const PLATFORM_PATTERNS = {
  linkedin:    ["linkedin.com/in/", "linkedin.com/pub/"],
  instagram:   ["instagram.com/"],
  twitter:     ["twitter.com/", "x.com/"],
  github:      ["github.com/"],
  tripadvisor: ["tripadvisor.com/Profile/", "tripadvisor.com/members/"],
  youtube:     ["youtube.com/channel/", "youtube.com/@", "youtube.com/user/"],
  reddit:      ["reddit.com/user/", "reddit.com/u/"],
  medium:      ["medium.com/@"],
};

async function googleSearch(query) {
  if (GOOGLE_API_KEY && GOOGLE_CSE_ID) {
    try {
      const res = await axios.get("https://www.googleapis.com/customsearch/v1", {
        params: { key: GOOGLE_API_KEY, cx: GOOGLE_CSE_ID, q: query, num: 5 },
        timeout: 6000,
      });
      return (res.data.items || []).map(r => ({ url: r.link, title: r.title, snippet: r.snippet || "" }));
    } catch {}
  }
  if (SERPAPI_KEY) {
    try {
      const res = await axios.get("https://serpapi.com/search", {
        params: { api_key: SERPAPI_KEY, q: query, engine: "google", num: 5 },
        timeout: 8000,
      });
      return (res.data.organic_results || []).map(r => ({ url: r.link, title: r.title, snippet: r.snippet || "" }));
    } catch {}
  }
  try {
    const res = await axios.get(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { timeout: 6000 }
    );
    const results = [];
    if (res.data.AbstractURL) results.push({ url: res.data.AbstractURL, title: res.data.Heading, snippet: res.data.AbstractText });
    for (const r of res.data.RelatedTopics || []) {
      if (r.FirstURL) results.push({ url: r.FirstURL, title: r.Text?.substring(0, 60), snippet: r.Text || "" });
    }
    return results;
  } catch { return []; }
}

function detectPlatform(url) {
  for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
    for (const pattern of patterns) {
      if (url.includes(pattern)) return platform;
    }
  }
  return null;
}

// ── Validate that a profile URL actually belongs to this person ──
function isValidProfileUrl(url, name, email) {
  if (!url) return false;
  const local     = email.split("@")[0].toLowerCase().replace(/[._-]/g, "");
  const nameParts = name.toLowerCase().split(" ").filter(p => p.length > 2);
  const urlLower  = url.toLowerCase();

  // Extract username from URL
  let username = "";
  if (urlLower.includes("linkedin.com/in/")) username = urlLower.split("linkedin.com/in/")[1]?.split("/")[0] || "";
  else if (urlLower.includes("github.com/"))  username = urlLower.split("github.com/")[1]?.split("/")[0] || "";
  else if (urlLower.includes("twitter.com/")) username = urlLower.split("twitter.com/")[1]?.split("/")[0] || "";
  else if (urlLower.includes("x.com/"))       username = urlLower.split("x.com/")[1]?.split("/")[0] || "";
  else if (urlLower.includes("medium.com/@")) username = urlLower.split("medium.com/@")[1]?.split("/")[0] || "";
  else return true; // for platforms like reddit, tripadvisor — accept

  if (!username || username.length < 2) return false;

  // Clean username
  const cleanUsername = username.replace(/[._-]/g, "");

  // Check 1: username contains email local part
  if (cleanUsername.includes(local) || local.includes(cleanUsername)) return true;

  // Check 2: username contains any part of name
  if (nameParts.some(part => cleanUsername.includes(part))) return true;

  // Check 3: email local part contains username
  if (local.includes(cleanUsername.substring(0, 5))) return true;

  console.log("⚠️ Rejected profile URL (name mismatch):", url, "| username:", username, "| expected:", local);
  return false;
}

async function scrapeUrl(url) {
  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      timeout: 5000,
    });
    return res.data
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 2000);
  } catch { return ""; }
}

function extractAge(textArray) {
  const combined = textArray.join(" ");
  const currentYear = new Date().getFullYear();
  let estimatedAge = null, ageSource = null;

  const bornMatch = combined.match(/\bborn\s+(?:in\s+)?(\d{4})\b/i);
  if (bornMatch) {
    const y = parseInt(bornMatch[1]);
    if (y > 1955 && y < currentYear - 15) { estimatedAge = currentYear - y; ageSource = "birth year mention"; }
  }
  if (!estimatedAge) {
    const classMatch = combined.match(/\b(?:class|batch|graduated?|graduation)\s+(?:of\s+)?(\d{4})\b/i);
    if (classMatch) {
      const y = parseInt(classMatch[1]);
      if (y >= 2000 && y <= currentYear) { estimatedAge = (currentYear - y) + 22; ageSource = "graduation year"; }
    }
  }
  if (!estimatedAge) {
    const expMatches = [...combined.matchAll(/(\d{1,2})\+?\s+years?\s+(?:of\s+)?(?:experience|expertise)/gi)];
    if (expMatches.length > 0) {
      const expYears = Math.min(...expMatches.map(m => parseInt(m[1])));
      if (expYears >= 2 && expYears <= 35) { estimatedAge = 22 + expYears; ageSource = "work experience duration"; }
    }
  }
  if (estimatedAge && (estimatedAge < 20 || estimatedAge > 65)) { estimatedAge = null; ageSource = null; }

  const ageRange = estimatedAge
    ? estimatedAge < 25 ? "18-24" : estimatedAge < 35 ? "25-34"
      : estimatedAge < 45 ? "35-44" : estimatedAge < 55 ? "45-54" : "55+"
    : null;

  return { age: estimatedAge, ageRange, ageSource };
}

function extractSalaryEstimate(textArray) {
  const combined = textArray.join(" ").toLowerCase();
  let salaryRange = null, salarySource = null;
  const lpaMatch = combined.match(/(\d{1,3}(?:\.\d)?)\s*(?:lpa|lakh(?:s)?\s*per\s*annum|lac)/i);
  if (lpaMatch) {
    const lpa = parseFloat(lpaMatch[1]);
    salaryRange  = lpa < 5 ? "₹3–5 LPA" : lpa < 10 ? "₹5–10 LPA" : lpa < 20 ? "₹10–20 LPA" : lpa < 40 ? "₹20–40 LPA" : "₹40+ LPA";
    salarySource = "explicit mention";
  }
  if (!salaryRange) {
    const titleMap = [
      { patterns: ["ceo","founder","co-founder","managing director"], range: "₹40+ LPA",   level: "C-Suite" },
      { patterns: ["cto","cfo","vp ","vice president","director"],    range: "₹30–50 LPA", level: "Senior Executive" },
      { patterns: ["senior manager","principal","staff engineer"],     range: "₹20–35 LPA", level: "Senior Manager" },
      { patterns: ["manager","team lead","senior software"],          range: "₹12–22 LPA", level: "Manager" },
      { patterns: ["software engineer","developer","analyst"],        range: "₹6–15 LPA",  level: "Mid-Level" },
      { patterns: ["junior","fresher","trainee","intern"],            range: "₹2–6 LPA",   level: "Entry Level" },
    ];
    for (const { patterns, range, level } of titleMap) {
      if (patterns.some(p => combined.includes(p))) { salaryRange = range; salarySource = `estimated from job title (${level})`; break; }
    }
  }
  if (!salaryRange) {
    const premium = ["google","microsoft","amazon","meta","apple","goldman sachs"];
    const mid     = ["infosys","tcs","wipro","hcl","cognizant","accenture"];
    if (premium.some(c => combined.includes(c))) { salaryRange = "₹25–60 LPA"; salarySource = "premium company"; }
    else if (mid.some(c => combined.includes(c))) { salaryRange = "₹6–20 LPA"; salarySource = "IT services company"; }
  }
  return { salaryRange: salaryRange || "Unknown", salarySource };
}

function extractLocation(textArray) {
  const combined = textArray.join(" ");
  const locMatch = combined.match(/(?:based\s+in|located\s+in|living\s+in|location\s*:?\s*|from\s+)\s*([A-Z][a-zA-Z\s,]+?)(?:\s*[|\·•]|\s*\n|$)/i);
  if (locMatch && locMatch[1].length < 50) return { city: locMatch[1].trim(), source: "explicit mention" };
  const cities = [
    "Mumbai","Delhi","Bangalore","Bengaluru","Hyderabad","Chennai","Kolkata","Pune",
    "Ahmedabad","Jaipur","Coimbatore","New York","London","Singapore","Dubai",
    "San Francisco","Seattle","Toronto","Sydney","Berlin",
  ];
  for (const city of cities) {
    if (combined.includes(city)) return { city, source: "city name detected" };
  }
  return { city: "Unknown", source: null };
}

function extractLifestyle(textArray) {
  const combined = textArray.join(" ").toLowerCase();
  const signals  = [];
  const map = {
    "Frequent Traveler":  ["frequent flyer","miles","nomad","globetrotter","countries visited"],
    "Luxury Lifestyle":   ["luxury","premium","vip","first class","business class","5-star","high-end"],
    "Health Conscious":   ["fitness","gym","yoga","marathon","running","cycling","workout","wellness"],
    "Tech Enthusiast":    ["coding","open source","github","hackathon","programming","machine learning"],
    "Foodie":             ["foodie","restaurant","michelin","chef","gourmet","culinary"],
    "Outdoor Adventurer": ["hiking","trekking","camping","adventure","mountaineering","diving"],
    "Family Oriented":    ["family","kids","children","parenting","family vacation"],
    "Culture Enthusiast": ["museum","gallery","theater","literature","art","heritage"],
    "Social Influencer":  ["influencer","followers","content creator","blogger","vlogger"],
    "Entrepreneur":       ["founder","startup","entrepreneur","co-founder","angel investor"],
  };
  for (const [lifestyle, keywords] of Object.entries(map)) {
    if (keywords.some(k => combined.includes(k))) signals.push(lifestyle);
  }
  let travelFrequency = "Occasional";
  if (combined.match(/\d{2,3}\s*(?:countries|cities)/i)) travelFrequency = "Very Frequent";
  else if (/(frequent|often|every month|monthly)\s*(travel|fly|trip)/i.test(combined)) travelFrequency = "Frequent";
  else if (/(vacation|holiday|travel|trip)/i.test(combined)) travelFrequency = "Regular";
  let spendingLevel = "Mid-Range";
  if (/(luxury|premium|five.star|5.star|first class|business class)/i.test(combined)) spendingLevel = "High";
  else if (/(budget|affordable|cheap|hostel|backpack)/i.test(combined)) spendingLevel = "Budget";
  return { lifestyleSignals: signals, travelFrequency, spendingLevel };
}

function extractProfession(textArray) {
  const combined = textArray.join(" ").toLowerCase();
  const profMap  = [
    { pattern: /\b(ceo|chief executive|founder|co-founder)\b/i,            role: "CEO/Founder",         seniority: "C-Suite"          },
    { pattern: /\b(cto|cfo|coo|chief\s+\w+\s+officer)\b/i,                role: "C-Suite Executive",    seniority: "C-Suite"          },
    { pattern: /\b(vice\s+president|vp\s+of|director\s+of)\b/i,           role: "VP/Director",          seniority: "Senior Executive"  },
    { pattern: /\b(senior\s+manager|principal\s+\w+|staff\s+engineer)\b/i, role: "Senior Manager",       seniority: "Senior"           },
    { pattern: /\b(manager|team\s+lead|lead\s+\w+)\b/i,                   role: "Manager/Lead",         seniority: "Mid-Senior"       },
    { pattern: /\b(software\s+engineer|developer|programmer|sde)\b/i,     role: "Software Engineer",    seniority: "Mid-Level"        },
    { pattern: /\b(data\s+scientist|ml\s+engineer|ai\s+engineer)\b/i,     role: "Data/AI Engineer",     seniority: "Mid-Level"        },
    { pattern: /\b(doctor|physician|surgeon|medical)\b/i,                 role: "Medical Professional", seniority: "Professional"     },
    { pattern: /\b(lawyer|attorney|advocate|legal)\b/i,                   role: "Legal Professional",   seniority: "Professional"     },
    { pattern: /\b(professor|lecturer|researcher|scientist)\b/i,          role: "Academic/Researcher",  seniority: "Professional"     },
    { pattern: /\b(analyst|consultant|specialist)\b/i,                    role: "Analyst/Consultant",   seniority: "Mid-Level"        },
    { pattern: /\b(intern|trainee|fresher|junior)\b/i,                    role: "Entry Level/Intern",   seniority: "Junior"           },
    { pattern: /\b(student|undergraduate|postgraduate|phd)\b/i,           role: "Student",              seniority: "Student"          },
  ];
  for (const { pattern, role, seniority } of profMap) {
    if (pattern.test(combined)) return { role, seniority };
  }
  return { role: "Professional", seniority: "Unknown" };
}

// ── MAIN SEARCH FUNCTION ─────────────────────────────────────
async function searchGuest(email, name) {
  const local = email.split("@")[0];
  const start = Date.now();

  // ── Generic email providers — skip risky web search entirely ──
  const GENERIC_DOMAINS = ["gmail.com","yahoo.com","hotmail.com","outlook.com",
                            "rediffmail.com","icloud.com","protonmail.com","ymail.com","live.com"];
  const emailDomain = email.split("@")[1]?.toLowerCase() || "";

  if (GENERIC_DOMAINS.includes(emailDomain)) {
    console.log("Generic email provider detected — skipping web search to avoid wrong-person data:", emailDomain);
    return {
      found: {},
      scrapedData: {},
      snippets: [],
      metadata: {
        fullName: null,
        age: null, ageRange: null, ageSource: null,
        location: "Unknown", locationSource: null,
        profession: null, company: null, seniority: null, industry: null,
        salary: "Unknown", salarySource: null,
        skills: [], education: [], pastCompanies: [],
        lifestyle: [], travelFrequency: "Unknown", spendingLevel: "Unknown",
        dataSource: "Limited — generic email provider",
        isGenericEmail: true,
      },
      pdlData: null,
      hunterData: null,
    };
  }

  // STEP 1 — APIs first (most accurate)
  console.log("Calling Hunter.io + PDL APIs...");
  const [pdlResult, hunterResult] = await Promise.allSettled([
    pdlLookup(email, name),
    hunterLookup(email),
  ]);
  const pdlData     = pdlResult.status    === "fulfilled" ? pdlResult.value    : null;
  const hunterData  = hunterResult.status === "fulfilled" ? hunterResult.value : null;
  const apiMetadata = buildMetadataFromAPIs(pdlData, hunterData);

  console.log("PDL:", pdlData ? "Found" : "Not found");
  console.log("Hunter:", hunterData ? "Found" : "Not found");

  // STEP 2 — Smarter search queries
  const queries = [
    // Most specific — email + platform
    `"${email}" site:linkedin.com/in`,
    `"${email}" site:github.com`,
    `"${email}" site:twitter.com OR site:x.com`,
    // Name + company domain (e.g. arival.ai)
    `"${name}" site:linkedin.com/in "${email.split("@")[1]}"`,
    // Fallback — email general search
    `"${email}"`,
    // Name-based fallback
    `"${name}" "${local}" linkedin profile`,
    `"${name}" "${local}" github`,
  ];

  console.log("Running " + queries.length + " searches in parallel...");
  const allResults = await Promise.allSettled(queries.map(q => googleSearch(q)));
  console.log("Searches done in " + (Date.now() - start) + "ms");

  const found       = {};
  const allSnippets = [];

  for (const result of allResults) {
    if (result.status !== "fulfilled") continue;
    for (const r of result.value) {
      if (!r.url) continue;
      const platform = detectPlatform(r.url);
      // Only add if URL passes name/email validation
      if (platform && !found[platform] && isValidProfileUrl(r.url, name, email)) {
        found[platform] = r.url;
        console.log("Profile accepted:", platform, "→", r.url);
      }
      if (r.snippet) allSnippets.push(r.snippet);
      if (r.title)   allSnippets.push(r.title);
    }
  }

  // STEP 3 — Add verified API profile URLs (highest priority — override search results)
  if (apiMetadata?.linkedinFromAPI) {
    found.linkedin = apiMetadata.linkedinFromAPI;
    console.log("LinkedIn from PDL/Hunter:", apiMetadata.linkedinFromAPI);
  }
  if (apiMetadata?.twitterFromAPI) {
    found.twitter = apiMetadata.twitterFromAPI;
    console.log("Twitter from PDL/Hunter:", apiMetadata.twitterFromAPI);
  }
  if (apiMetadata?.githubFromAPI) {
    found.github = apiMetadata.githubFromAPI;
    console.log("GitHub from PDL/Hunter:", apiMetadata.githubFromAPI);
  }

  console.log("Final profiles: " + (Object.keys(found).join(", ") || "none"));

  // STEP 4 — Scrape non-blocked profiles
  const BLOCKED     = ["linkedin", "instagram", "facebook", "twitter"];
  const scrapedData = {};

  const scrapePromises = Object.entries(found)
    .filter(([platform]) => !BLOCKED.includes(platform))
    .map(async ([platform, url]) => {
      const text = await scrapeUrl(url);
      if (text) scrapedData[platform] = text;
    });

  if (found.reddit) {
    scrapePromises.push((async () => {
      try {
        const username = found.reddit.split("/user/")[1]?.split("/")[0]
                      || found.reddit.split("/u/")[1]?.split("/")[0];
        if (username) {
          const res   = await axios.get(
            "https://www.reddit.com/user/" + username + "/submitted.json?limit=10",
            { headers: { "User-Agent": "HospitalityIntelligence/1.0" }, timeout: 5000 }
          );
          const posts = res.data?.data?.children || [];
          const text  = posts.map(p => p.data.subreddit + " " + p.data.title + " " + p.data.selftext).join(" ");
          if (text) scrapedData["reddit"] = text.substring(0, 2000);
        }
      } catch {}
    })());
  }

  await Promise.allSettled(scrapePromises);

  // STEP 5 — Build metadata
  const allText = [...allSnippets, ...Object.values(scrapedData)];

  // Filter snippets to only those relevant to this specific guest
  // (mentions their name, email domain, or company) — avoids picking up
  // unrelated people/places from generic search results
  const emailDomainRoot = email.split("@")[1]?.split(".")[0]?.toLowerCase() || "";
  const nameWords       = (name || "").toLowerCase().split(" ").filter(p => p.length > 2);
  const companyLower    = (apiMetadata?.company || "").toLowerCase();

  const relevantText = allText.filter(s => {
    const sl = s.toLowerCase();
    if (emailDomainRoot.length > 3 && sl.includes(emailDomainRoot)) return true;
    if (companyLower && companyLower.length > 2 && sl.includes(companyLower)) return true;
    if (nameWords.length >= 2 && nameWords.every(p => sl.includes(p))) return true;
    return false;
  });

  // Use relevant text when available, fall back to full text only if nothing relevant found
  const textForExtraction = relevantText.length > 0 ? relevantText : allText;

  const ageData       = extractAge(textForExtraction);
  const salaryData    = extractSalaryEstimate(textForExtraction);
  const locationData  = extractLocation(relevantText.length > 0 ? relevantText : []); // location: only trust relevant snippets, else Unknown
  const lifestyleData = extractLifestyle(allText);
  const profData      = extractProfession(textForExtraction);

  let metadata;
  if (apiMetadata) {
    metadata = {
      ...apiMetadata,
      age:             apiMetadata.age      || ageData.age,
      ageRange:        apiMetadata.ageRange || ageData.ageRange,
      ageSource:       apiMetadata.ageSource || (ageData.ageSource ? ageData.ageSource + " (estimated)" : null),
      salary:          apiMetadata.salary      || salaryData.salaryRange,
      salarySource:    apiMetadata.salarySource || (salaryData.salarySource ? salaryData.salarySource + " (estimated)" : null),
      location:        apiMetadata.location     || locationData.city,
      locationSource:  apiMetadata.locationSource || (locationData.source ? locationData.source + " (estimated)" : null),
      profession:      apiMetadata.profession   || profData.role,
      seniority:       apiMetadata.seniority    || profData.seniority,
      lifestyle:       lifestyleData.lifestyleSignals,
      travelFrequency: lifestyleData.travelFrequency,
      spendingLevel:   lifestyleData.spendingLevel,
    };

    // Fix salary from profession if missing
    // Fix salary from profession — match by keyword, not exact string
    if (metadata.profession) {
      const profLower = metadata.profession.toLowerCase();
      let mapped = null;

      if (profLower.includes("ceo") || profLower.includes("founder"))
        mapped = { salary: "₹40+ LPA", src: "estimated from CEO/Founder title" };
      else if (profLower.includes("cto") || profLower.includes("cfo") || profLower.includes("coo"))
        mapped = { salary: "₹30–50 LPA", src: "estimated from C-Suite title" };
      else if (profLower.includes("vp") || profLower.includes("director"))
        mapped = { salary: "₹25–40 LPA", src: "estimated from VP/Director title" };
      else if (profLower.includes("senior manager") || profLower.includes("principal"))
        mapped = { salary: "₹20–35 LPA", src: "estimated from Senior Manager title" };
      else if (profLower.includes("manager") || profLower.includes("lead"))
        mapped = { salary: "₹12–22 LPA", src: "estimated from Manager title" };
      else if (profLower.includes("software") || profLower.includes("developer"))
        mapped = { salary: "₹6–15 LPA", src: "estimated from Software Engineer title" };
      else if (profLower.includes("data") || profLower.includes("ai engineer"))
        mapped = { salary: "₹8–20 LPA", src: "estimated from Data/AI Engineer title" };

      if (mapped && (!metadata.salary || metadata.salary === "Unknown" || (metadata.salarySource || "").includes("entry level"))) {
        metadata.salary       = mapped.salary;
        metadata.salarySource = mapped.src;
        console.log("Salary corrected:", metadata.profession, "→", mapped.salary);
      }
    }
  } else {
    metadata = {
      age:             ageData.age,
      ageRange:        ageData.ageRange,
      ageSource:       ageData.ageSource ? ageData.ageSource + " (estimated)" : null,
      salary:          salaryData.salaryRange,
      salarySource:    salaryData.salarySource ? salaryData.salarySource + " (estimated)" : null,
      location:        locationData.city,
      locationSource:  locationData.source ? locationData.source + " (estimated)" : null,
      profession:      profData.role,
      seniority:       profData.seniority,
      lifestyle:       lifestyleData.lifestyleSignals,
      travelFrequency: lifestyleData.travelFrequency,
      spendingLevel:   lifestyleData.spendingLevel,
      dataSource:      "Google Search Snippets (estimated)",
    };
  }

  console.log("Total time: " + (Date.now() - start) + "ms");
  return { found, scrapedData, snippets: allSnippets, metadata, pdlData, hunterData };
}

module.exports = { searchGuest };