require("dotenv").config();
const pool = require("./db");

const sampleStays = [
  { email: "mohan.raj@arival.ai",          name: "Mohan Raj",      checkIn: "2025-03-12", checkOut: "2025-03-15", nights: 3, room: "Executive Suite",      persona: "Business Traveler", amount: 24500, points: 245 },
  { email: "priya.sharma@infosys.com",     name: "Priya Sharma",   checkIn: "2025-05-02", checkOut: "2025-05-04", nights: 2, room: "Deluxe Room",          persona: "Leisure Traveler",  amount: 14200, points: 142 },
  { email: "arjun.mehta@tcs.com",          name: "Arjun Mehta",    checkIn: "2025-06-18", checkOut: "2025-06-22", nights: 4, room: "Presidential Suite",   persona: "Luxury Traveler",   amount: 89000, points: 890 },
  { email: "divya.nair@wipro.com",         name: "Divya Nair",     checkIn: "2025-07-05", checkOut: "2025-07-06", nights: 1, room: "Standard Room",        persona: "Business Traveler", amount: 6800,  points: 68  },
  { email: "rahul.verma@accenture.com",    name: "Rahul Verma",    checkIn: "2025-08-14", checkOut: "2025-08-18", nights: 4, room: "Family Suite",         persona: "Family Traveler",   amount: 31200, points: 312 },
  { email: "sneha.iyer@cognizant.com",     name: "Sneha Iyer",     checkIn: "2025-09-01", checkOut: "2025-09-03", nights: 2, room: "Deluxe Room",          persona: "Food Traveler",     amount: 17600, points: 176 },
  { email: "vikram.singh@hcl.com",         name: "Vikram Singh",   checkIn: "2025-10-09", checkOut: "2025-10-11", nights: 2, room: "Adventure Base Room",  persona: "Adventure Traveler",amount: 12400, points: 124 },
  { email: "ananya.gupta@flipkart.com",    name: "Ananya Gupta",   checkIn: "2025-11-20", checkOut: "2025-11-23", nights: 3, room: "Executive Suite",      persona: "Business Traveler", amount: 27800, points: 278 },
  { email: "karthik.raman@zoho.com",       name: "Karthik Raman",  checkIn: "2025-12-05", checkOut: "2025-12-07", nights: 2, room: "Eco Green Room",       persona: "Eco Traveler",      amount: 11500, points: 115 },
  { email: "meera.pillai@swiggy.com",      name: "Meera Pillai",   checkIn: "2026-01-15", checkOut: "2026-01-17", nights: 2, room: "Art Deco Suite",       persona: "Arts Traveler",     amount: 19900, points: 199 },
];

async function seed() {
  for (const s of sampleStays) {
    await pool.query(
      `INSERT INTO guest_stay_history
       (email, guest_name, check_in_date, check_out_date, nights_stayed, room_type, persona, amount_spent, loyalty_points)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [s.email, s.name, s.checkIn, s.checkOut, s.nights, s.room, s.persona, s.amount, s.points]
    );
    console.log("Seeded:", s.name, s.email);
  }
  console.log("Done seeding guest_stay_history");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });