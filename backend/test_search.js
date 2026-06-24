require('dotenv').config();
const axios = require('axios');

async function test() {
  const queries = [
    '"mohan.raj@arival.ai" site:linkedin.com/in',
    '"mohan.raj@arival.ai"',
    '"Mohan Raj" site:linkedin.com/in "arival.ai"',
  ];

  for (const q of queries) {
    try {
      const res = await axios.get('https://serpapi.com/search', {
        params: { api_key: process.env.SERPAPI_KEY, q, engine: 'google', num: 5 },
        timeout: 10000
      });
      const results = res.data.organic_results || [];
      console.log(`Query: ${q}`);
      console.log(`Results: ${results.length}`);
      if (results.length > 0) console.log(`First: ${results[0].link}`);
      console.log('---');
    } catch(e) {
      console.log(`Error for: ${q} → ${e.message}`);
    }
  }
}

test();