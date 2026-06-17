require('dotenv').config();
const axios = require('axios');

axios.post('http://localhost:5000/api/email/send-ad', {
  guestEmail: '23d132@psgitech.ac.in',
  guestName: 'Test Guest',
  persona: 'Business Traveler',
  variantLabel: 'Personalised Offer',
  svgString: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="blue"/></svg>',
  qrDataUrl: null,
  formUrl: 'http://localhost:3000/preferences',
  offer: 'Test offer',
  roomRec: 'Test room'
}).then(r => console.log('SUCCESS:', r.data))
.catch(e => console.log('ERROR:', e.response?.data || e.message));