import React, { useState } from "react";
import axios from "axios";

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ padding: "36px 40px 24px", borderBottom: "1px solid #D0D7DE", background: "#fff" }}>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#0D1117", marginBottom: 4 }}>{title}</h1>
      <p style={{ color: "#57606A", fontSize: 14 }}>{subtitle}</p>
    </div>
  );
}

function Label({ children }) {
  return <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0D1117", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{children}</label>;
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14,
        border: "1.5px solid #D0D7DE", outline: "none", color: "#0D1117",
        fontFamily: "'DM Sans', sans-serif", background: "#fff",
      }}
      onFocus={e => e.target.style.borderColor = "#B8860B"}
      onBlur={e => e.target.style.borderColor = "#D0D7DE"}
    />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value} onChange={onChange}
      style={{
        width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14,
        border: "1.5px solid #D0D7DE", outline: "none", color: value ? "#0D1117" : "#8B949E",
        fontFamily: "'DM Sans', sans-serif", background: "#fff", cursor: "pointer",
      }}
      onFocus={e => e.target.style.borderColor = "#B8860B"}
      onBlur={e => e.target.style.borderColor = "#D0D7DE"}
    >{children}</select>
  );
}

function MultiSelect({ options, selected, onChange }) {
  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter(v => v !== val));
    else onChange([...selected, val]);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => (
        <button
          key={opt} type="button" onClick={() => toggle(opt)}
          style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
            border: selected.includes(opt) ? "none" : "1.5px solid #D0D7DE",
            background: selected.includes(opt) ? "linear-gradient(135deg, #B8860B, #D4A017)" : "#fff",
            color: selected.includes(opt) ? "#fff" : "#57606A",
            cursor: "pointer", transition: "all 0.15s",
          }}
        >{opt}</button>
      ))}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontFamily: "'DM Serif Display', serif", fontSize: 17, color: "#0D1117",
      paddingBottom: 12, borderBottom: "1px solid #E8ECF0", marginBottom: 20,
    }}>{children}</div>
  );
}

const AMENITIES = ["Spa", "Pool", "Gym", "Business Center", "Restaurant", "Bar", "Concierge", "Room Service", "Parking", "Pet Friendly", "Kids Club", "Airport Shuttle"];
const ACTIVITIES = ["City Tour", "Cooking Class", "Adventure Sports", "Cultural Experience", "Beach Activities", "Wildlife Safari", "Wine Tasting", "Yoga / Wellness", "Shopping", "Nightlife", "Photography Tour", "Nature Walk"];

export default function PreferenceForm() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", nationality: "",
    room_type: "", bed_type: "", floor_preference: "",
    dietary: "", budget_range: "", stay_purpose: "",
    loyalty_member: false, loyalty_number: "",
    special_requests: "",
    amenities: [], activities: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setLoading(true); setError("");
    try {
      await axios.post("/api/preference/submit", form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div>
        <PageHeader title="Guest Preferences" subtitle="Tell us what you prefer for the best experience." />
        <div style={{ padding: "80px 40px", textAlign: "center", animation: "fadeIn 0.4s ease" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🏨</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#0D1117", marginBottom: 8 }}>Thank You, {form.name}!</div>
          <div style={{ fontSize: 15, color: "#57606A", maxWidth: 400, margin: "0 auto 32px" }}>
            Your preferences have been saved. Our team will ensure your stay is perfectly tailored for you.
          </div>
          <button onClick={() => { setSubmitted(false); setForm({ name:"",email:"",phone:"",nationality:"",room_type:"",bed_type:"",floor_preference:"",dietary:"",budget_range:"",stay_purpose:"",loyalty_member:false,loyalty_number:"",special_requests:"",amenities:[],activities:[] }); }}
            style={{
              padding: "12px 28px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #B8860B, #D4A017)",
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Guest Preference Form" subtitle="Help us personalise your stay by sharing your preferences. All fields are optional except Name and Email." />
      <div style={{ padding: "32px 40px" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #D0D7DE", padding: "28px 32px", marginBottom: 20 }}>
            <SectionTitle>Personal Details</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div><Label>Full Name *</Label><Input value={form.name} onChange={set("name")} placeholder="Your full name" /></div>
              <div><Label>Email Address *</Label><Input value={form.email} onChange={set("email")} placeholder="your@email.com" type="email" /></div>
              <div><Label>Phone Number</Label><Input value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" /></div>
              <div><Label>Nationality</Label><Input value={form.nationality} onChange={set("nationality")} placeholder="e.g. Indian" /></div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #D0D7DE", padding: "28px 32px", marginBottom: 20 }}>
            <SectionTitle>Room Preferences</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div>
                <Label>Room Type</Label>
                <Select value={form.room_type} onChange={set("room_type")}>
                  <option value="">Select room type</option>
                  {["Standard", "Deluxe", "Superior", "Suite", "Penthouse", "Villa", "Family Room"].map(o => <option key={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <Label>Bed Type</Label>
                <Select value={form.bed_type} onChange={set("bed_type")}>
                  <option value="">Select bed type</option>
                  {["King", "Queen", "Twin", "Single", "Double", "Bunk"].map(o => <option key={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <Label>Floor Preference</Label>
                <Select value={form.floor_preference} onChange={set("floor_preference")}>
                  <option value="">No preference</option>
                  {["Low Floor (1-5)", "Mid Floor (6-15)", "High Floor (16+)", "Top Floor"].map(o => <option key={o}>{o}</option>)}
                </Select>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #D0D7DE", padding: "28px 32px", marginBottom: 20 }}>
            <SectionTitle>Dining & Lifestyle</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <Label>Dietary Requirements</Label>
                <Select value={form.dietary} onChange={set("dietary")}>
                  <option value="">No restriction</option>
                  {["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-Free", "Nut Allergy", "Dairy-Free"].map(o => <option key={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <Label>Budget Range</Label>
                <Select value={form.budget_range} onChange={set("budget_range")}>
                  <option value="">Select budget</option>
                  {["Economy (₹2K-5K/night)", "Mid-range (₹5K-15K/night)", "Premium (₹15K-40K/night)", "Luxury (₹40K+/night)"].map(o => <option key={o}>{o}</option>)}
                </Select>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #D0D7DE", padding: "28px 32px", marginBottom: 20 }}>
            <SectionTitle>Preferred Amenities</SectionTitle>
            <MultiSelect options={AMENITIES} selected={form.amenities} onChange={v => setForm(f => ({ ...f, amenities: v }))} />
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #D0D7DE", padding: "28px 32px", marginBottom: 20 }}>
            <SectionTitle>Preferred Activities</SectionTitle>
            <MultiSelect options={ACTIVITIES} selected={form.activities} onChange={v => setForm(f => ({ ...f, activities: v }))} />
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #D0D7DE", padding: "28px 32px", marginBottom: 20 }}>
            <SectionTitle>Stay Purpose & Loyalty</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <Label>Purpose of Stay</Label>
                <Select value={form.stay_purpose} onChange={set("stay_purpose")}>
                  <option value="">Select purpose</option>
                  {["Leisure / Vacation", "Business", "Honeymoon", "Anniversary", "Family Trip", "Medical", "Education"].map(o => <option key={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <Label>Loyalty Member?</Label>
                <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
                  {[["Yes", true], ["No", false]].map(([label, val]) => (
                    <button key={label} type="button"
                      onClick={() => setForm(f => ({ ...f, loyalty_member: val }))}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                        border: "1.5px solid",
                        borderColor: form.loyalty_member === val ? "#B8860B" : "#D0D7DE",
                        background: form.loyalty_member === val ? "#FEF3C7" : "#fff",
                        color: form.loyalty_member === val ? "#92400E" : "#57606A",
                        cursor: "pointer",
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
            </div>
            {form.loyalty_member && (
              <div><Label>Loyalty / Membership Number</Label><Input value={form.loyalty_number} onChange={set("loyalty_number")} placeholder="e.g. HI-123456" /></div>
            )}
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #D0D7DE", padding: "28px 32px", marginBottom: 28 }}>
            <SectionTitle>Special Requests</SectionTitle>
            <textarea
              value={form.special_requests} onChange={set("special_requests")}
              placeholder="Any special requests, requirements, or notes for our team..."
              rows={4}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 8, fontSize: 14,
                border: "1.5px solid #D0D7DE", outline: "none", color: "#0D1117",
                fontFamily: "'DM Sans', sans-serif", resize: "vertical", lineHeight: 1.6,
              }}
              onFocus={e => e.target.style.borderColor = "#B8860B"}
              onBlur={e => e.target.style.borderColor = "#D0D7DE"}
            />
          </div>

          {error && (
            <div style={{ padding: 14, background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 10, color: "#991B1B", fontSize: 13, marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit" disabled={loading || !form.name || !form.email}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: loading ? "#D0D7DE" : "linear-gradient(135deg, #B8860B, #D4A017)",
              color: loading ? "#8B949E" : "#fff", fontSize: 16, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif",
              letterSpacing: 0.3,
            }}
          >
            {loading ? "Saving Preferences..." : "✓ Submit Preferences"}
          </button>
        </form>
      </div>
    </div>
  );
}