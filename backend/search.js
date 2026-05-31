const axios = require("axios");
require("dotenv").config();

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

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

// ── Single search query ──────────────────────────────────────
async function googleSearch(query) {
  // Try Google CSE first (fastest)
  if (GOOGLE_API_KEY && GOOGLE_CSE_ID) {
    try {
      const res = await axios.get("https://www.googleapis.com/customsearch/v1", {
        params: { key: GOOGLE_API_KEY, cx: GOOGLE_CSE_ID, q: query, num: 5 },
        timeout: 6000,
      });
      const items = res.data.items || [];
      return items.map((r) => ({ url: r.link, title: r.title, snippet: r.snippet || "" }));
    } catch (err) {
      // quota or error — fall through to SerpAPI
    }
  }

  // Try SerpAPI
  if (SERPAPI_KEY) {
    try {
      const res = await axios.get("https://serpapi.com/search", {
        params: { api_key: SERPAPI_KEY, q: query, engine: "google", num: 5 },
        timeout: 8000,
      });
      const results = res.data.organic_results || [];
      return results.map((r) => ({ url: r.link, title: r.title, snippet: r.snippet || "" }));
    } catch (err) {
      // fall through to DDG
    }
  }

  // DuckDuckGo fallback
  try {
    const encoded = encodeURIComponent(query);
    const res = await axios.get(
      `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`,
      { timeout: 6000 }
    );
    const results = [];
    const data = res.data;
    if (data.AbstractURL) {
      results.push({ url: data.AbstractURL, title: data.Heading, snippet: data.AbstractText });
    }
    for (const r of data.RelatedTopics || []) {
      if (r.FirstURL) results.push({ url: r.FirstURL, title: r.Text?.substring(0, 60), snippet: r.Text || "" });
    }
    return results;
  } catch {
    return [];
  }
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
  } catch {
    return "";
  }
}

async function searchGuest(email, name) {
  const local  = email.split("@")[0];
  const domain = email.split("@")[1] || "";

  // ── Run ALL queries in PARALLEL ─────────────────────────
  const queries = [
    `"${email}" linkedin`,
    `"${email}" instagram OR github OR twitter`,
    `"${email}"`,
    `"${name}" "${local}" linkedin`,
    `"${name}" "${local}" github`,
  ];

  console.log(`🔍 Running ${queries.length} searches in parallel...`);
  const start = Date.now();

  const allResults = await Promise.allSettled(
    queries.map((q) => googleSearch(q))
  );

  console.log(`✅ All searches done in ${Date.now() - start}ms`);

  const found       = {};
  const allSnippets = [];

  for (const result of allResults) {
    if (result.status !== "fulfilled") continue;
    for (const r of result.value) {
      if (!r.url) continue;
      const platform = detectPlatform(r.url);
      if (platform && !found[platform]) {
        found[platform] = r.url;
      }
      if (r.snippet) allSnippets.push(r.snippet);
    }
  }

  console.log(`🎯 Profiles found: ${Object.keys(found).join(", ") || "none"}`);

  // ── Scrape non-blocked profiles in parallel ─────────────
  const BLOCKED = ["linkedin", "instagram", "facebook", "twitter"];
  const scrapedData = {};

  const scrapePromises = Object.entries(found)
    .filter(([platform]) => !BLOCKED.includes(platform))
    .map(async ([platform, url]) => {
      const text = await scrapeUrl(url);
      if (text) scrapedData[platform] = text;
    });

  // Reddit JSON fetch
  if (found.reddit) {
    scrapePromises.push((async () => {
      try {
        const username = found.reddit.split("/user/")[1]?.split("/")[0]
                      || found.reddit.split("/u/")[1]?.split("/")[0];
        if (username) {
          const res = await axios.get(
            `https://www.reddit.com/user/${username}/submitted.json?limit=10`,
            { headers: { "User-Agent": "HospitalityIntelligence/1.0" }, timeout: 5000 }
          );
          const posts = res.data?.data?.children || [];
          const text  = posts.map((p) => `${p.data.subreddit} ${p.data.title} ${p.data.selftext}`).join(" ");
          if (text) scrapedData["reddit"] = text.substring(0, 2000);
        }
      } catch {}
    })());
  }

  await Promise.allSettled(scrapePromises);

  console.log(`✅ Total time: ${Date.now() - start}ms`);

  return { found, scrapedData, snippets: allSnippets };
}

module.exports = { searchGuest };