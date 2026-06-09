const axios = require("axios");
require("dotenv").config();

const SERPAPI_KEY    = process.env.SERPAPI_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID  = process.env.GOOGLE_CSE_ID;
const HUNTER_API_KEY = process.env.HUNTER_API_KEY;
const PDL_API_KEY    = process.env.PDL_API_KEY;

// ── HUNTER.IO — Email enrichment ────────────────────────────
async function hunterLookup(email) {
  if (!HUNTER_API_KEY) return null;

  const domain     = email.split("@")[1] || "";
  let jobTitle     = null;
  let company      = null;
  let fullName     = null;
  let linkedin     = null;
  let twitter      = null;
  let emailStatus  = null;

  // Step 1 — Verify email (gets status + basic info)
  try {
    const res = await axios.get("https://api.hunter.io/v2/email-verifier", {
      params: { email, api_key: HUNTER_API_KEY },
      timeout: 8000,
    });
    const d = res.data?.data;
    if (d) {
      emailStatus = d.status || null;
      console.log("✅ Hunter verified:", email, "→", emailStatus);
    }
  } catch (err) {
    console.log("⚠️ Hunter verify error:", err.response?.data?.errors?.[0]?.details || err.message);
  }

  // Step 2 — Domain search to get people at that company
  try {
    const res = await axios.get("https://api.hunter.io/v2/domain-search", {
      params: { domain, api_key: HUNTER_API_KEY, limit: 10 },
      timeout: 8000,
    });
    const data    = res.data?.data;
    company       = data?.organization || null;
    const emails  = data?.emails || [];

    // Find the exact email in domain results
    const match   = emails.find(e => e.value?.toLowerCase() === email.toLowerCase());
    if (match) {
      fullName  = `${match.first_name || ""} ${match.last_name || ""}`.trim() || null;
      jobTitle  = match.position    || null;
      linkedin  = match.linkedin    || null;
      twitter   = match.twitter     || null;
      console.log("✅ Hunter domain match:", fullName, "|", jobTitle, "at", company);
    } else if (emails.length > 0) {
      // Use company name at least
      console.log("✅ Hunter found company:", company, "but no exact email match");
    }
  } catch (err) {
    console.log("⚠️ Hunter domain error:", err.response?.data?.errors?.[0]?.details || err.message);
  }

  // Return null only if we got nothing at all
  if (!emailStatus && !company && !jobTitle) return null;

  return { fullName, jobTitle, company, linkedin, twitter, emailStatus, source: "Hunter.io" };
}

// ── PEOPLE DATA LABS — Deep person enrichment ────────────────
async function pdlLookup(email, name) {
  if (!PDL_API_KEY) return null;
  try {
    // Try Person Enrichment API first
    const res = await axios.get("https://api.peopledatalabs.com/v5/person/enrich", {
      params: { email, pretty: true },
      headers: { "X-Api-Key": PDL_API_KEY },
      timeout: 8000,
    });
    const d = res.data;
    if (!d || d.status !== 200) {
      // If enrichment fails (404), try Person Search API
      console.log("⚠️ PDL enrichment not found, trying search...");
      return await pdlSearch(email, name);
    }

    console.log("✅ PDL data found:", d.data?.full_name, d.data?.job_title);
    const person     = d.data || d;
    const experience = person.experience || [];
    const totalExp   = experience.length > 0
      ? new Date().getFullYear() - new Date(
          experience[experience.length - 1]?.start_date || "2000-01-01"
        ).getFullYear()
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
      skills:          (person.skills || []).slice(0, 10).map(s => s.name || s).filter(Boolean),
      education:       (person.education || []).map(e => e.school?.name).filter(Boolean),
      pastCompanies:   experience.slice(0, 3).map(e => e.company?.name).filter(Boolean),
      linkedin:        person.linkedin_url     || null,
      twitter:         person.twitter_url      || null,
      github:          person.github_url       || null,
      source:          "People Data Labs",
    };
  } catch (err) {
    console.log("⚠️ PDL enrichment error:", err.response?.data?.error?.message || err.message);
    // Try PDL Search as fallback
    return await pdlSearch(email, name);
  }
}

// ── PDL Person Search (fallback when enrichment returns 404) ─
async function pdlSearch(email, name) {
  if (!PDL_API_KEY) return null;
  try {
    const nameParts   = (name || "").split(" ");
    const firstName   = nameParts[0] || "";
    const lastName    = nameParts.slice(1).join(" ") || "";
    const emailDomain = email.split("@")[1]?.toLowerCase() || "";
    const domainRoot  = emailDomain.split(".")[0];

    // Generic email providers — name match too risky
    const genericDomains = ["gmail.com","yahoo.com","hotmail.com","outlook.com","rediffmail.com","icloud.com"];
    const isGenericEmail = genericDomains.includes(emailDomain);

    // Common Indian names — high risk of wrong person match
    const commonNames = ["kumar","raj","sharma","singh","gupta","patel","verma","yadav","mehta","joshi","nair","reddy","iyer"];
    const isCommonName = commonNames.some(n => name.toLowerCase().split(" ").includes(n));

    const res = await axios.post(
      "https://api.peopledatalabs.com/v5/person/search",
      {
        query: {
          bool: {
            should: [
              { match: { emails: email } },
              {
                bool: {
                  must: [
                    { match: { first_name: firstName } },
                    { match: { last_name:  lastName  } },
                  ],
                },
              },
            ],
          },
        },
        size: 3,
      },
      {
        headers: {
          "X-Api-Key":    PDL_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 8000,
      }
    );

    const results = res.data?.data || [];
    if (results.length === 0) {
      console.log("⚠️ PDL search: no record found for", email);
      return null;
    }

    // ── PRIORITY 1: exact email match (most reliable) ──
    let person = results.find(p => {
      const emailList = p.emails || [];
      // PDL emails can be strings OR objects — handle both safely
      return Array.isArray(emailList) && emailList.some(e => {
        const addr = typeof e === "string" ? e : (e?.address || e?.value || "");
        return addr.toLowerCase() === email.toLowerCase();
      });
    });
    if (person) console.log("✅ PDL matched by exact email:", person.full_name, person.job_title);

    // ── PRIORITY 2: company domain matches email domain (e.g. arival.ai) ──
    if (!person && !isGenericEmail && domainRoot.length > 2) {
      person = results.find(p => {
        const website = (p.job_company_website || "").toLowerCase();
        const company = (p.job_company_name   || "").toLowerCase();
        return website.includes(domainRoot) || company.includes(domainRoot);
      });
      if (person) console.log("✅ PDL matched by company domain:", domainRoot, "→", person.full_name, person.job_title);
    }

    // ── PRIORITY 3: name match only for non-common names + non-generic emails ──
    if (!person && !isCommonName && !isGenericEmail) {
      person = results[0];
      console.log("⚠️ PDL using name match (verify manually):", person?.full_name, "at", person?.job_company_name);
    }

    if (!person) {
      console.log("⚠️ PDL skipping — common name or generic email, too risky:", name, email);
      return null;
    }

    console.log("✅ PDL final:", person.full_name, "|", person.job_title, "at", person.job_company_name);
    const experience = person.experience || [];
    const totalExp   = experience.length > 0
      ? new Date().getFullYear() - new Date(
          experience[experience.length - 1]?.start_date || "2000-01-01"
        ).getFullYear()
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
      skills:          (person.skills || []).slice(0, 10).map(s => s.name || s).filter(Boolean),
      education:       (person.education || []).map(e => e.school?.name).filter(Boolean),
      pastCompanies:   experience.slice(0, 3).map(e => e.company?.name).filter(Boolean),
      linkedin:        person.linkedin_url     || null,
      twitter:         person.twitter_url      || null,
      github:          person.github_url       || null,
      source:          "People Data Labs (search)",
    };
  } catch (err) {
    console.log("⚠️ PDL search error:", err.response?.data?.error?.message || err.message);
    return null;
  }
}

// ── Build metadata from PDL + Hunter data ────────────────────
function buildMetadataFromAPIs(pdlData, hunterData) {
  if (!pdlData && !hunterData) return null;
  const d = pdlData   || {};
  const h = hunterData || {};

  function estimateSalary(seniority, yearsExp) {
    const map = {
      cxo:       "₹40+ LPA",
      vp:        "₹30–50 LPA",
      director:  "₹25–40 LPA",
      manager:   "₹12–25 LPA",
      senior:    "₹12–22 LPA",
      entry:     "₹3–7 LPA",
      training:  "₹2–5 LPA",
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
    fullName:         d.fullName        || h.fullName        || null,
    age:              d.age             || null,
    birthYear:        d.birthYear       || null,
    ageRange:         d.age
      ? d.age < 25 ? "18–24"
        : d.age < 35 ? "25–34"
        : d.age < 45 ? "35–44"
        : d.age < 55 ? "45–54"
        : "55+"
      : null,
    ageSource:        d.birthYear ? "birth year (People Data Labs)" : null,
    location:         d.location        || null,
    country:          d.country         || null,
    locationSource:   d.location        ? "People Data Labs" : null,
    profession:       d.jobTitle        || h.jobTitle        || null,
    company:          d.jobCompany      || h.company         || null,
    seniority:        d.jobSeniority    || null,
    industry:         d.industry        || null,
    jobRole:          d.jobRole         || null,
    yearsExperience:  d.yearsExperience || null,
    pastCompanies:    d.pastCompanies   || [],
    salary:           salary.range,
    salarySource:     salary.source,
    skills:           d.skills          || [],
    education:        d.education       || [],
    linkedinFromAPI:  d.linkedin        || h.linkedin        || null,
    twitterFromAPI:   d.twitter         || h.twitter         || null,
    githubFromAPI:    d.github          || null,
    emailStatus:      h.emailStatus     || null,
    dataSource:       [
      pdlData    ? d.source    || "People Data Labs" : null,
      hunterData ? h.source    || "Hunter.io"        : null,
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
    const encoded = encodeURIComponent(query);
    const res     = await axios.get(
      `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`,
      { timeout: 6000 }
    );
    const results = [];
    const data    = res.data;
    if (data.AbstractURL) results.push({ url: data.AbstractURL, title: data.Heading, snippet: data.AbstractText });
    for (const r of data.RelatedTopics || []) {
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

// ── Metadata extraction fallbacks (used when APIs return nothing) ──
function extractAge(textArray) {
  const combined   = textArray.join(" ");
  const currentYear = new Date().getFullYear();
  let estimatedAge = null, ageSource = null;
  const bornMatch  = combined.match(/\bborn\s+(?:in\s+)?(\d{4})\b/i);
  if (bornMatch) {
    const y = parseInt(bornMatch[1]);
    if (y > 1940 && y < currentYear - 15) { estimatedAge = currentYear - y; ageSource = "birth year mention"; }
  }
  if (!estimatedAge) {
    const classMatch = combined.match(/\b(?:class|batch|graduated?|graduation)\s+(?:of\s+)?(\d{4})\b/i);
    if (classMatch) {
      const y = parseInt(classMatch[1]);
      if (y > 1990 && y <= currentYear) { estimatedAge = (currentYear - y) + 22; ageSource = "graduation year"; }
    }
  }
  if (!estimatedAge) {
    const expMatch = combined.match(/(\d{1,2})\+?\s+years?\s+(?:of\s+)?experience/i);
    if (expMatch) { estimatedAge = 22 + parseInt(expMatch[1]); ageSource = "work experience duration"; }
  }
  if (!estimatedAge) {
    const ageMatch = combined.match(/\b(?:aged?|age\s*:?)\s*(\d{2})\b/i) || combined.match(/\b(\d{2})\s+years?\s+old\b/i);
    if (ageMatch) {
      const a = parseInt(ageMatch[1]);
      if (a >= 16 && a <= 90) { estimatedAge = a; ageSource = "direct age mention"; }
    }
  }
  return {
    age:      estimatedAge,
    ageRange: estimatedAge
      ? estimatedAge < 25 ? "18-24" : estimatedAge < 35 ? "25-34"
        : estimatedAge < 45 ? "35-44" : estimatedAge < 55 ? "45-54" : "55+"
      : "Unknown",
    ageSource,
  };
}

function extractSalaryEstimate(textArray) {
  const combined = textArray.join(" ").toLowerCase();
  let salaryRange = null, salarySource = null;
  const lpaMatch  = combined.match(/(\d{1,3}(?:\.\d)?)\s*(?:lpa|lakh(?:s)?\s*per\s*annum|lac)/i);
  if (lpaMatch) {
    const lpa   = parseFloat(lpaMatch[1]);
    salaryRange = lpa < 5 ? "₹3–5 LPA" : lpa < 10 ? "₹5–10 LPA" : lpa < 20 ? "₹10–20 LPA" : lpa < 40 ? "₹20–40 LPA" : "₹40+ LPA";
    salarySource = "explicit mention";
  }
  if (!salaryRange) {
    const titleMap = [
      { patterns: ["ceo","founder","co-founder","managing director"], range: "₹40+ LPA", level: "C-Suite" },
      { patterns: ["cto","cfo","vp ","vice president","director"],    range: "₹30–50 LPA", level: "Senior Executive" },
      { patterns: ["senior manager","principal","staff engineer","lead engineer"], range: "₹20–35 LPA", level: "Senior Manager" },
      { patterns: ["manager","team lead","senior software","senior developer"],    range: "₹12–22 LPA", level: "Manager" },
      { patterns: ["software engineer","developer","analyst","consultant"],        range: "₹6–15 LPA",  level: "Mid-Level" },
      { patterns: ["junior","fresher","trainee","intern"],                         range: "₹2–6 LPA",   level: "Entry Level" },
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
    "Ahmedabad","Jaipur","Surat","Lucknow","Coimbatore","New York","London",
    "Singapore","Dubai","San Francisco","Seattle","Toronto","Sydney","Berlin",
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
    "Frequent Traveler":  ["frequent flyer","miles","nomad","globetrotter","visited","countries visited"],
    "Luxury Lifestyle":   ["luxury","premium","vip","first class","business class","5-star","high-end","designer"],
    "Health Conscious":   ["fitness","gym","yoga","marathon","running","cycling","workout","wellness"],
    "Tech Enthusiast":    ["developer","coding","open source","github","hackathon","programming","ai","machine learning"],
    "Foodie":             ["foodie","restaurant","michelin","chef","gourmet","culinary","food blogger"],
    "Outdoor Adventurer": ["hiking","trekking","camping","adventure","mountaineering","diving","surfing"],
    "Family Oriented":    ["family","kids","children","parenting","family vacation"],
    "Culture Enthusiast": ["museum","gallery","theater","literature","books","art","heritage"],
    "Social Influencer":  ["influencer","followers","content creator","blogger","vlogger"],
    "Entrepreneur":       ["founder","startup","entrepreneur","co-founder","angel investor","bootstrapped"],
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
    { pattern: /\b(ceo|chief executive|founder|co-founder)\b/i,          role: "CEO/Founder",          seniority: "C-Suite"         },
    { pattern: /\b(cto|cfo|coo|chief\s+\w+\s+officer)\b/i,              role: "C-Suite Executive",     seniority: "C-Suite"         },
    { pattern: /\b(vice\s+president|vp\s+of|director\s+of)\b/i,         role: "VP/Director",           seniority: "Senior Executive" },
    { pattern: /\b(senior\s+manager|principal\s+\w+|staff\s+engineer)\b/i, role: "Senior Manager",     seniority: "Senior"          },
    { pattern: /\b(manager|team\s+lead|lead\s+\w+)\b/i,                 role: "Manager/Lead",          seniority: "Mid-Senior"      },
    { pattern: /\b(software\s+engineer|developer|programmer|sde)\b/i,   role: "Software Engineer",     seniority: "Mid-Level"       },
    { pattern: /\b(data\s+scientist|ml\s+engineer|ai\s+engineer)\b/i,   role: "Data/AI Engineer",      seniority: "Mid-Level"       },
    { pattern: /\b(doctor|physician|surgeon|medical)\b/i,               role: "Medical Professional",  seniority: "Professional"    },
    { pattern: /\b(lawyer|attorney|advocate|legal)\b/i,                 role: "Legal Professional",    seniority: "Professional"    },
    { pattern: /\b(professor|lecturer|researcher|scientist)\b/i,        role: "Academic/Researcher",   seniority: "Professional"    },
    { pattern: /\b(analyst|consultant|specialist)\b/i,                  role: "Analyst/Consultant",    seniority: "Mid-Level"       },
    { pattern: /\b(intern|trainee|fresher|junior)\b/i,                  role: "Entry Level/Intern",    seniority: "Junior"          },
    { pattern: /\b(student|undergraduate|postgraduate|phd)\b/i,         role: "Student",               seniority: "Student"         },
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

  // ── STEP 1: Call Hunter.io + PDL APIs in parallel ──────────
  console.log("🔑 Calling Hunter.io + People Data Labs APIs...");
  const [pdlResult, hunterResult] = await Promise.allSettled([
    pdlLookup(email, name),
    hunterLookup(email),
  ]);

  const pdlData     = pdlResult.status    === "fulfilled" ? pdlResult.value    : null;
  const hunterData  = hunterResult.status === "fulfilled" ? hunterResult.value : null;
  const apiMetadata = buildMetadataFromAPIs(pdlData, hunterData);

  console.log("📊 PDL data:",    pdlData    ? "✅ Found" : "❌ Not found");
  console.log("📊 Hunter data:", hunterData ? "✅ Found" : "❌ Not found");
  console.log("📊 API metadata:", apiMetadata ? "✅ Built" : "⚠️  Falling back to search snippets");

  // ── STEP 2: Google/SerpAPI search ─────────────────────────
  const queries = [
    `"${email}" linkedin`,
    `"${email}" instagram OR github OR twitter`,
    `"${email}"`,
    `"${name}" "${local}" linkedin`,
    `"${name}" "${local}" github`,
    `"${name}" age location profession`,
    `"${name}" salary experience company`,
  ];

  console.log(`🔍 Running ${queries.length} searches in parallel...`);
  const allResults = await Promise.allSettled(queries.map(q => googleSearch(q)));
  console.log(`✅ Searches done in ${Date.now() - start}ms`);

  const found       = {};
  const allSnippets = [];

  for (const result of allResults) {
    if (result.status !== "fulfilled") continue;
    for (const r of result.value) {
      if (!r.url) continue;
      const platform = detectPlatform(r.url);
      if (platform && !found[platform]) found[platform] = r.url;
      if (r.snippet) allSnippets.push(r.snippet);
      if (r.title)   allSnippets.push(r.title);
    }
  }

  // Merge API-found social profiles
  if (apiMetadata?.linkedinFromAPI && !found.linkedin) found.linkedin = apiMetadata.linkedinFromAPI;
  if (apiMetadata?.twitterFromAPI  && !found.twitter)  found.twitter  = apiMetadata.twitterFromAPI;
  if (apiMetadata?.githubFromAPI   && !found.github)   found.github   = apiMetadata.githubFromAPI;

  console.log(`🎯 Profiles found: ${Object.keys(found).join(", ") || "none"}`);

  // ── STEP 3: Scrape non-blocked profiles ───────────────────
  const BLOCKED    = ["linkedin", "instagram", "facebook", "twitter"];
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
          const res  = await axios.get(
            `https://www.reddit.com/user/${username}/submitted.json?limit=10`,
            { headers: { "User-Agent": "HospitalityIntelligence/1.0" }, timeout: 5000 }
          );
          const posts = res.data?.data?.children || [];
          const text  = posts.map(p => `${p.data.subreddit} ${p.data.title} ${p.data.selftext}`).join(" ");
          if (text) scrapedData["reddit"] = text.substring(0, 2000);
        }
      } catch {}
    })());
  }

  await Promise.allSettled(scrapePromises);

  // ── STEP 4: Build final metadata ──────────────────────────
  const allText = [...allSnippets, ...Object.values(scrapedData)];
  let metadata;

  // Always extract from snippets — used to fill any gaps left by APIs
  const ageData        = extractAge(allText);
  const salaryData     = extractSalaryEstimate(allText);
  const locationData   = extractLocation(allText);
  const lifestyleData  = extractLifestyle(allText);
  const professionData = extractProfession(allText);

  if (apiMetadata) {
    // APIs gave us real data — fill any null fields with snippet extraction
    metadata = {
      ...apiMetadata,
      // Age: use PDL if available, else estimate from snippets
      age:             apiMetadata.age      || ageData.age,
      ageRange:        apiMetadata.ageRange || ageData.ageRange,
      ageSource:       apiMetadata.ageSource
                         || (ageData.ageSource ? ageData.ageSource + " (estimated)" : null),
      // Salary: use PDL if available, else estimate from snippets
      salary:          apiMetadata.salary      || salaryData.salaryRange,
      salarySource:    apiMetadata.salarySource
                         || (salaryData.salarySource ? salaryData.salarySource + " (estimated)" : null),
      // Location: use PDL if available, else extract from snippets
      location:        apiMetadata.location     || locationData.city,
      locationSource:  apiMetadata.locationSource
                         || (locationData.source ? locationData.source + " (estimated)" : null),
      // Profession: use PDL/Hunter if available, else extract from snippets
      profession:      apiMetadata.profession   || professionData.role,
      seniority:       apiMetadata.seniority    || professionData.seniority,
      // Lifestyle always from snippets (richer text signal)
      lifestyle:       lifestyleData.lifestyleSignals,
      travelFrequency: apiMetadata.travelFrequency || lifestyleData.travelFrequency,
      spendingLevel:   apiMetadata.spendingLevel   || lifestyleData.spendingLevel,
      // PDL extras
      pdlSkills:        apiMetadata.skills        || [],
      pdlEducation:     apiMetadata.education     || [],
      pdlPastCompanies: apiMetadata.pastCompanies || [],
    };

    // Log what was filled by fallback
    if (!apiMetadata.age && ageData.age)
      console.log("📝 Age filled from snippets:", ageData.age, "(PDL had none)");
    if (!apiMetadata.location && locationData.city !== "Unknown")
      console.log("📝 Location filled from snippets:", locationData.city, "(PDL had none)");
    if (!apiMetadata.salary && salaryData.salaryRange !== "Unknown")
      console.log("📝 Salary filled from snippets:", salaryData.salaryRange, "(PDL had none)");
    // Override salary if profession is known but salary came from wrong fallback
    if (metadata.profession && metadata.salarySource === "entry level estimate (estimated)") {
      const profSalMap = {
        "CEO/Founder":        { salary: "₹40+ LPA",   src: "estimated from CEO/Founder title" },
        "C-Suite Executive":  { salary: "₹30–50 LPA", src: "estimated from C-Suite title" },
        "VP/Director":        { salary: "₹25–40 LPA", src: "estimated from VP/Director title" },
        "Senior Manager":     { salary: "₹20–35 LPA", src: "estimated from Senior Manager title" },
        "Manager/Lead":       { salary: "₹12–22 LPA", src: "estimated from Manager title" },
        "Software Engineer":  { salary: "₹6–15 LPA",  src: "estimated from Software Engineer title" },
        "Data/AI Engineer":   { salary: "₹8–20 LPA",  src: "estimated from Data/AI Engineer title" },
      };
      const mapped = profSalMap[metadata.profession];
      if (mapped) {
        metadata.salary       = mapped.salary;
        metadata.salarySource = mapped.src;
        console.log("📝 Salary corrected from profession:", metadata.profession, "→", mapped.salary);
      }
    }

  } else {
    // No API data at all — use only snippet extraction
    console.log("⚠️  No API data — using regex fallback from search snippets");
    metadata = {
      age:             ageData.age,
      ageRange:        ageData.ageRange,
      ageSource:       ageData.ageSource ? ageData.ageSource + " (estimated)" : null,
      salary:          salaryData.salaryRange,
      salarySource:    salaryData.salarySource ? salaryData.salarySource + " (estimated)" : null,
      location:        locationData.city,
      locationSource:  locationData.source ? locationData.source + " (estimated)" : null,
      profession:      professionData.role,
      seniority:       professionData.seniority,
      lifestyle:       lifestyleData.lifestyleSignals,
      travelFrequency: lifestyleData.travelFrequency,
      spendingLevel:   lifestyleData.spendingLevel,
      dataSource:      "Google Search Snippets (estimated)",
    };
  }

  console.log(`✅ Total time: ${Date.now() - start}ms`);
  return { found, scrapedData, snippets: allSnippets, metadata, pdlData, hunterData };
}

module.exports = { searchGuest };