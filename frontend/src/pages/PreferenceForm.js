import React, { useState } from "react";
import axios from "axios";

const API = "https://hospitality-backend-1.onrender.com";
// ── Pre-fill from QR code URL params ─────────────────────────
const params       = new URLSearchParams(window.location.search);
const prefillName  = params.get("name")  || "";
const prefillEmail = params.get("email") || "";

// ── Styles ────────────────────────────────────────────────────
const C = {
  bg:      "#F5F4F0", surface: "#FFFFFF", border: "#E2E0DA",
  text:    "#1C1917", textMid: "#57534E", textMute: "#A8A29E",
  fill:    "#1C1917", tag: "#F0EEE9", tagBorder: "#DDD9D3",
  divider: "#EDEBE5", inputBg: "#FAFAF8",
};

const AMENITIES = [
  "Spa","Pool","Gym","Business Center","Restaurant",
  "Bar","Concierge","Room Service","Parking",
  "Pet Friendly","Kids Club","Airport Shuttle",
];

const ACTIVITIES = [
  "City Tour","Cooking Class","Adventure Sports",
  "Cultural Experience","Beach Activities","Wildlife Safari",
  "Wine Tasting","Yoga / Wellness","Shopping",
  "Nightlife","Photography Tour","Nature Walk",
];

// ── Reusable components ───────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <div style={{ background:C.surface, borderRadius:10, border:`1px solid ${C.border}`, padding:"22px 26px", marginBottom:16 }}>
      <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:18, paddingBottom:12, borderBottom:`1px solid ${C.divider}` }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.07em" }}>
      {children}
    </label>
  );
}

function Input({ ...props }) {
  return (
    <input {...props} style={{ width:"100%", padding:"10px 13px", borderRadius:7, fontSize:13, border:`1px solid ${C.border}`, outline:"none", color:C.text, background:C.inputBg, fontFamily:"inherit", boxSizing:"border-box", transition:"all 0.15s" }}
      onFocus={e=>{ e.target.style.borderColor=C.text; e.target.style.background=C.surface; }}
      onBlur={e=> { e.target.style.borderColor=C.border; e.target.style.background=C.inputBg; }}
    />
  );
}

function SelectInput({ children, ...props }) {
  return (
    <select {...props} style={{ width:"100%", padding:"10px 13px", borderRadius:7, fontSize:13, border:`1px solid ${C.border}`, outline:"none", color:C.text, background:C.inputBg, fontFamily:"inherit", boxSizing:"border-box", cursor:"pointer", transition:"all 0.15s" }}
      onFocus={e=>{ e.target.style.borderColor=C.text; }}
      onBlur={e=> { e.target.style.borderColor=C.border; }}
    >
      {children}
    </select>
  );
}

function MultiSelect({ options, selected, onChange }) {
  const toggle = (val) => onChange(
    selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]
  );
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            style={{ padding:"6px 13px", borderRadius:5, fontSize:12, fontWeight:500, border:`1px solid ${active ? C.text : C.border}`, background: active ? C.text : C.bg, color: active ? "#fff" : C.textMid, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Grid2({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>{children}</div>;
}

function Grid3({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>{children}</div>;
}

// ── Main Component ────────────────────────────────────────────
export default function PreferenceForm() {
  const [form, setForm] = useState({
    name:             prefillName,
    email:            prefillEmail,
    phone:            "",
    nationality:      "",
    room_type:        "",
    bed_type:         "",
    floor_preference: "",
    dietary:          "",
    budget_range:     "",
    stay_purpose:     "",
    loyalty_member:   false,
    loyalty_number:   "",
    special_requests: "",
    amenities:        [],
    activities:       [],
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setE = (k)    => (e) => set(k, e.target.value);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) { setError("Name and email are required"); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/api/preference/submit`, form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed. Please try again.");
    } finally { setLoading(false); }
  }

  // ── Success Screen ────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:20 }}>
        <div style={{ background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, padding:"48px 40px", textAlign:"center", maxWidth:440, width:"100%" }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:C.tag, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:10, letterSpacing:"-0.2px" }}>
            Thank You, {form.name}!
          </h2>
          <p style={{ fontSize:13, color:C.textMid, lineHeight:1.7, marginBottom:6 }}>
            Your preferences have been saved successfully.
          </p>
          <p style={{ fontSize:12, color:C.textMute, lineHeight:1.6 }}>
            Our team will personalise your stay based on your preferences. We look forward to welcoming you!
          </p>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"'DM Sans','Helvetica Neue',sans-serif", background:C.bg, minHeight:"100vh", color:C.text }}>

      {/* Header */}
      <div style={{ padding:"26px 40px 20px", borderBottom:`1px solid ${C.border}`, background:C.surface }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:C.text, letterSpacing:"-0.3px", marginBottom:3 }}>Guest Preference Form</h1>
        <p style={{ color:C.textMid, fontSize:13 }}>Help us personalise your stay. Name and email are required — all other fields are optional.</p>
      </div>

      <div style={{ padding:"24px 40px", maxWidth:780, margin:"0 auto" }}>
        <form onSubmit={handleSubmit}>

          {/* Personal Details */}
          <SectionCard title="Personal Details">
            <Grid2>
              <div>
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={setE("name")} placeholder="Your full name" required />
              </div>
              <div>
                <Label>Email Address *</Label>
                <Input type="email" value={form.email} onChange={setE("email")} placeholder="your@email.com" required />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={form.phone} onChange={setE("phone")} placeholder="+91 98765 43210" />
              </div>
              <div>
                <Label>Nationality</Label>
                <Input value={form.nationality} onChange={setE("nationality")} placeholder="e.g. Indian" />
              </div>
            </Grid2>
          </SectionCard>

          {/* Room Preferences */}
          <SectionCard title="Room Preferences">
            <Grid3>
              <div>
                <Label>Room Type</Label>
                <SelectInput value={form.room_type} onChange={setE("room_type")}>
                  <option value="">Select room type</option>
                  {["Standard","Deluxe","Superior","Suite","Penthouse","Villa","Family Room"].map(o=><option key={o}>{o}</option>)}
                </SelectInput>
              </div>
              <div>
                <Label>Bed Type</Label>
                <SelectInput value={form.bed_type} onChange={setE("bed_type")}>
                  <option value="">Select bed type</option>
                  {["King","Queen","Twin","Single","Double","Bunk"].map(o=><option key={o}>{o}</option>)}
                </SelectInput>
              </div>
              <div>
                <Label>Floor Preference</Label>
                <SelectInput value={form.floor_preference} onChange={setE("floor_preference")}>
                  <option value="">No preference</option>
                  {["Low Floor (1–5)","Mid Floor (6–15)","High Floor (16+)","Top Floor"].map(o=><option key={o}>{o}</option>)}
                </SelectInput>
              </div>
            </Grid3>
          </SectionCard>

          {/* Dining & Budget */}
          <SectionCard title="Dining & Budget">
            <Grid2>
              <div>
                <Label>Dietary Requirements</Label>
                <SelectInput value={form.dietary} onChange={setE("dietary")}>
                  <option value="">No restriction</option>
                  {["Vegetarian","Vegan","Halal","Kosher","Gluten-Free","Nut Allergy","Dairy-Free","Jain"].map(o=><option key={o}>{o}</option>)}
                </SelectInput>
              </div>
              <div>
                <Label>Budget Range</Label>
                <SelectInput value={form.budget_range} onChange={setE("budget_range")}>
                  <option value="">Select budget</option>
                  {["Economy (₹2K–5K/night)","Mid-Range (₹5K–15K/night)","Premium (₹15K–40K/night)","Luxury (₹40K+/night)"].map(o=><option key={o}>{o}</option>)}
                </SelectInput>
              </div>
            </Grid2>
          </SectionCard>

          {/* Preferred Amenities */}
          <SectionCard title="Preferred Amenities">
            <MultiSelect options={AMENITIES} selected={form.amenities} onChange={v=>set("amenities",v)} />
          </SectionCard>

          {/* Preferred Activities */}
          <SectionCard title="Preferred Activities">
            <MultiSelect options={ACTIVITIES} selected={form.activities} onChange={v=>set("activities",v)} />
          </SectionCard>

          {/* Stay Purpose & Loyalty */}
          <SectionCard title="Stay Purpose & Loyalty">
            <Grid2>
              <div>
                <Label>Purpose of Stay</Label>
                <SelectInput value={form.stay_purpose} onChange={setE("stay_purpose")}>
                  <option value="">Select purpose</option>
                  {["Leisure / Vacation","Business","Honeymoon","Anniversary","Family Trip","Medical","Education"].map(o=><option key={o}>{o}</option>)}
                </SelectInput>
              </div>
              <div>
                <Label>Loyalty Member?</Label>
                <div style={{ display:"flex", gap:10, marginTop:2 }}>
                  {[["Yes", true],["No", false]].map(([label, val]) => (
                    <button key={label} type="button"
                      onClick={() => set("loyalty_member", val)}
                      style={{ flex:1, padding:"10px", borderRadius:7, fontSize:13, fontWeight:600, border:`1px solid ${form.loyalty_member === val ? C.text : C.border}`, background: form.loyalty_member === val ? C.text : C.bg, color: form.loyalty_member === val ? "#fff" : C.textMid, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </Grid2>
            {form.loyalty_member && (
              <div style={{ marginTop:16 }}>
                <Label>Loyalty / Membership Number</Label>
                <Input value={form.loyalty_number} onChange={setE("loyalty_number")} placeholder="e.g. HI-123456" />
              </div>
            )}
          </SectionCard>

          {/* Special Requests */}
          <SectionCard title="Special Requests">
            <textarea
              value={form.special_requests}
              onChange={setE("special_requests")}
              placeholder="Any special requests, requirements, celebrations, or accessibility needs..."
              rows={4}
              style={{ width:"100%", padding:"10px 13px", borderRadius:7, fontSize:13, border:`1px solid ${C.border}`, outline:"none", color:C.text, background:C.inputBg, fontFamily:"inherit", boxSizing:"border-box", resize:"vertical", lineHeight:1.6, transition:"all 0.15s" }}
              onFocus={e=>{ e.target.style.borderColor=C.text; e.target.style.background=C.surface; }}
              onBlur={e=> { e.target.style.borderColor=C.border; e.target.style.background=C.inputBg; }}
            />
          </SectionCard>

          {/* Error */}
          {error && (
            <div style={{ padding:"11px 14px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, color:"#DC2626", fontSize:13, marginBottom:16 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading || !form.name || !form.email}
            style={{ width:"100%", padding:"13px", borderRadius:8, border:"none", background: (loading || !form.name || !form.email) ? "#C8C5BC" : C.fill, color:"#fff", fontSize:14, fontWeight:700, cursor:(loading||!form.name||!form.email)?"not-allowed":"pointer", fontFamily:"inherit", letterSpacing:"0.02em", transition:"all 0.15s" }}>
            {loading ? "Saving Preferences..." : "Submit Preferences"}
          </button>

        </form>
      </div>

      <style>{`* { box-sizing: border-box; margin:0; padding:0; }`}</style>
    </div>
  );
}