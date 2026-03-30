const axios = require("axios");
require("dotenv").config();

const SERPAPI_KEY = process.env.SERPAPI_KEY;

const PLATFORM_PATTERNS = {
  linkedin: ["linkedin.com/in/", "linkedin.com/pub/"],
  instagram: ["instagram.com/"],
  twitter: ["twitter.com/", "x.com/"],
  github: ["github.com/"],
  tripadvisor: ["tripadvisor.com/Profile/", "tripadvisor.com/members/"],
  youtube: ["youtube.com/channel/", "youtube.com/@", "youtube.com/user/"],
  reddit: ["reddit.com/user/", "reddit.com/u/"],
  medium: ["medium.com/@"],
};

async function googleSearch(query) {
  if (SERPAPI_KEY) {
    try {
      console.log(`🔍 Searching: ${query}`);
      const res = await axios.get("https://serpapi.com/search", {
        params: { api_key: SERPAPI_KEY, q: query, engine: "google", num: 5 },
        timeout: 10000,
      });
      const results = res.data.organic_results || [];
      console.log(`✅ Found ${results.length} results`);
      return results.map((r) => ({ url: r.link, title: r.title, snippet: r.snippet || "" }));
    } catch (err) {
      console.log("SerpAPI failed:", err.message);
    }
  }

  // DuckDuckGo fallback
  try {
    const encoded = encodeURIComponent(query);
    const res = await axios.get(
      `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`,
      { timeout: 8000 }
    );
    const results = [];
    const data = res.data;
    if (data.AbstractURL) results.push({ url: data.AbstractURL, title: data.Heading, snippet: data.AbstractText });
    for (const r of data.RelatedTopics || []) {
      if (r.FirstURL) results.push({ url: r.FirstURL, title: r.Text?.substring(0, 60), snippet: r.Text || "" });
    }
    return results;
  } catch (err) {
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
      timeout: 8000,
    });
    const text = res.data
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 3000);
    return text;
  } catch {
    return "";
  }
}

async function searchGuest(email, name) {
  const domain = email.split("@")[1];
  const company = domain.split(".")[0];

  const queries = [
    `"${name}" "${company}" site:linkedin.com/in`,
    `"${name}" "${company}" linkedin`,
    `"${email}"`,
    `"${name}" "${domain}"`,
    `"${name}" "${company}" github`,
    `"${name}" "${company}" twitter`,
  ];

  const found = {};
  const allSnippets = [];
  const searchResults = [];

  for (const query of queries) {
    try {
      const results = await googleSearch(query);
      for (const r of results) {
        const platform = detectPlatform(r.url);
        if (platform) {
          const titleLower = (r.title || "").toLowerCase();
          const companyMatch = titleLower.includes(company.toLowerCase());

          // Prefer company-matched results, only set if not already found with company match
          if (!found[platform] || companyMatch) {
            found[platform] = r.url;
          }
        }
        if (r.snippet) allSnippets.push(r.snippet);
        searchResults.push({ query, ...r, platform });
      }
      await delay(300);
    } catch (err) {
      // continue
    }
  }

  // Scrape found profile pages
  const scrapedData = {};
  for (const [platform, url] of Object.entries(found)) {
    if (!["linkedin", "instagram", "facebook"].includes(platform)) {
      const text = await scrapeUrl(url);
      if (text) scrapedData[platform] = text;
    }
  }

  // Reddit JSON
  if (found.reddit) {
    try {
      const username = found.reddit.split("/user/")[1]?.split("/")[0];
      if (username) {
        const res = await axios.get(`https://www.reddit.com/user/${username}/posts.json?limit=15`, {
          headers: { "User-Agent": "HospitalityIntelligence/1.0" },
          timeout: 8000,
        });
        const posts = res.data?.data?.children || [];
        const text = posts.map((p) => `${p.data.subreddit} ${p.data.title} ${p.data.selftext}`).join(" ");
        if (text) scrapedData["reddit"] = text;
      }
    } catch {}
  }

  return { found, scrapedData, snippets: allSnippets, searchResults };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { searchGuest };