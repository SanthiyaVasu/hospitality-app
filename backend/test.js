require('dotenv').config();
const axios = require('axios');

axios.get('https://serpapi.com/search', {
  params: {
    api_key: process.env.SERPAPI_KEY,
    q: 'Mohan Raj arival site:linkedin.com/in',
    engine: 'google',
    num: 5
  }
}).then(r => {
  const results = r.data.organic_results || [];
  console.log('Results:', results.length);
  results.forEach(r => console.log(r.link, '|', r.title));
}).catch(e => console.log('ERROR:', e.message));