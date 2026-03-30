import React, { useState } from "react";
import axios from "axios";

const API = "https://hospitality-app-39zz.onrender.com";

const PERSONA_COLORS = {
  "Luxury Traveler": { bg: "#FEF3C7", accent: "#D97706", icon: "💎" },
  "Business Traveler": { bg: "#EFF6FF", accent: "#2563EB", icon: "💼" },
  "Leisure Traveler": { bg: "#F0FDF4", accent: "#16A34A", icon: "🌴" },
  "Adventure Traveler": { bg: "#FFF7ED", accent: "#EA580C", icon: "🧗" },
  "Family Traveler": { bg: "#FDF4FF", accent: "#9333EA", icon: "👨‍👩‍👧" },
  "Food Traveler": { bg: "#FFF1F2", accent: "#E11D48", icon: "🍽️" },
  "Tech Traveler": { bg: "#F0F9FF", accent: "#0284C7", icon: "💻" },
  "Eco Traveler": { bg: "#F0FDF4", accent: "#15803D", icon: "🌿" },
  "Arts Traveler": { bg: "#FFF7ED", accent: "#C2410C", icon: "🎨" },
  "Sports Traveler": { bg: "#ECFDF5", accent: "#059669", icon: "⚽" },
};

const PLATFORM_ICONS = {
  linkedin: { icon: "in", color: "#0A66C2", bg: "#E8F0FE" },
  instagram: { icon: "📸", color: "#E1306C", bg: "#FFF0F5" },
  twitter: { icon: "𝕏", color: "#000", bg: "#F5F5F5" },
  github: { icon: "⌥", color: "#24292F", bg: "#F6F8FA" },
  youtube: { icon: "▶", color: "#FF0000", bg: "#FFF0F0" },
  reddit: { icon: "r/", color: "#FF4500", bg: "#FFF3EE" },
  tripadvisor: { icon: "✈", color: "#00AA6C", bg: "#F0FFF8" },
  medium: { icon: "M", color: "#000", bg: "#F5F5F5" },
};

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ padding: "36px 40px 24px", borderBottom: "1px solid #D0D7DE", background: "#fff" }}>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#0D1117", marginBottom: 4 }}>{title}</h1>
      <p style={{ color: "#57606A", fontSize: 14 }}>{subtitle}</p>
    </div>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#57606A", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: "#0D1117", fontWeight: 600 }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: "#E8ECF0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${value}%`, borderRadius: 10,
          background: color, transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

const SCORE_COLORS = {
  luxury: "#D97706", business: "#2563EB", leisure: "#16A34A", adventure: "#EA580C",
  family: "#9333EA", food: "#E11D48", tech: "#0284C7", eco: "#15803D", arts: "#C2410C", sports: "#059669",
};

export default function GuestLookup() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState("");

  const STEPS = [
    "Searching Google with email ID...",
    "Scanning LinkedIn, Instagram, GitHub...",
    "Scraping public profile data...",
    "Running NLP analysis...",
    "Generating guest persona...",
    "Saving to database...",
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true); setResult(null); setError("");
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % STEPS.length;
      setStep(STEPS[stepIdx]);
    }, 2500);
    setStep(STEPS[0]);
    try {
      const res = await axios.post(`${API}/api/guest/lookup`, form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false); setStep("");
    }
  }

  const persona = result?.analysis?.persona;
  const pStyle = PERSONA_COLORS[persona] || { bg: "#F6F8FA", accent: "#57606A", icon: "👤" };

  return (
    <div>
      <PageHeader
        title="Guest Intelligence Lookup"
        subtitle="Enter a guest's name and email to discover their online presence, analyse behaviour, and generate a guest persona."
      />
      <div style={{ padding: "32px 40px" }}>
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #D0D7DE",
          padding: "28px 32px", marginBottom: 28,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "end" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0D1117", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Guest Name
                </label>
                <input
                  type="text" placeholder="e.g. Santhosh Kumar"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14,
                    border: "1.5px solid #D0D7DE", outline: "none", color: "#0D1117",
                    fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#B8860B"}
                  onBlur={e => e.target.style.borderColor = "#D0D7DE"}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#0D1117", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Email ID
                </label>
                <input
                  type="email" placeholder="e.g. santhosh@gmail.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14,
                    border: "1.5px solid #D0D7DE", outline: "none", color: "#0D1117",
                    fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#B8860B"}
                  onBlur={e => e.target.style.borderColor = "#D0D7DE"}
                />
              </div>
              <button
                type="submit" disabled={loading || !form.name || !form.email}
                style={{
                  padding: "10px 28px", borderRadius: 8, border: "none",
                  background: loading ? "#D0D7DE" : "linear-gradient(135deg, #B8860B, #D4A017)",
                  color: loading ? "#8B949E" : "#fff", fontSize: 14, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                  fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.3,
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Analysing..." : "🔍 Analyse Guest"}
              </button>
            </div>
          </form>

          {loading && (
            <div style={{ marginTop: 20, padding: "14px 16px", background: "#FEF3C7", borderRadius: 8, border: "1px solid #FCD34D", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 16, height: 16, border: "2.5px solid #D97706", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: 13, color: "#92400E", fontWeight: 500 }}>{step}</span>
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: 16, background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 10, color: "#991B1B", fontSize: 13, marginBottom: 24 }}>
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{
              background: pStyle.bg, border: `1.5px solid ${pStyle.accent}30`,
              borderRadius: 16, padding: "24px 28px", marginBottom: 24,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 40 }}>{pStyle.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: pStyle.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Guest Persona</div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#0D1117" }}>{persona}</div>
                  <div style={{ fontSize: 13, color: "#57606A", marginTop: 2 }}>{result.guest.name} · {result.guest.email}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#57606A", marginBottom: 4 }}>Data Quality</div>
                <div style={{
                  display: "inline-block", padding: "4px 12px", borderRadius: 20,
                  background: result.analysis.dataQuality === "High" ? "#D1FAE5" : result.analysis.dataQuality === "Medium" ? "#FEF3C7" : "#F3F4F6",
                  color: result.analysis.dataQuality === "High" ? "#065F46" : result.analysis.dataQuality === "Medium" ? "#92400E" : "#374151",
                  fontSize: 12, fontWeight: 600,
                }}>{result.analysis.dataQuality}</div>
                <div style={{ fontSize: 11, color: "#8B949E", marginTop: 6 }}>DB ID: #{result.guestId}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #D0D7DE", padding: "20px 24px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0D1117", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Social Profiles Found ({Object.keys(result.profiles).length})
                </h3>
                {Object.keys(result.profiles).length === 0 ? (
                  <p style={{ color: "#8B949E", fontSize: 13 }}>No public profiles found for this email.</p>
                ) : (
                  Object.entries(result.profiles).map(([platform, url]) => {
                    const p = PLATFORM_ICONS[platform] || { icon: "🌐", color: "#57606A", bg: "#F6F8FA" };
                    return (
                      <div key={platform} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px", borderRadius: 8, background: p.bg, marginBottom: 8,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: p.color, color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, flexShrink: 0,
                        }}>{p.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#0D1117", textTransform: "capitalize" }}>{platform}</div>
                          <a href={url} target="_blank" rel="noreferrer" style={{
                            fontSize: 11, color: p.color, textDecoration: "none",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block",
                          }}>{url.length > 50 ? url.substring(0, 50) + "..." : url}</a>
                        </div>
                      </div>
                    );
                  })
                )}
                {result.scrapedPlatforms.length > 0 && (
                  <div style={{ marginTop: 12, padding: "8px 10px", background: "#F0FDF4", borderRadius: 6 }}>
                    <span style={{ fontSize: 11, color: "#065F46" }}>✅ Scraped data from: {result.scrapedPlatforms.join(", ")}</span>
                  </div>
                )}
              </div>

              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #D0D7DE", padding: "20px 24px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0D1117", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Behaviour Scores
                </h3>
                {Object.entries(result.analysis.scores).map(([key, val]) => (
                  <ScoreBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val} color={SCORE_COLORS[key]} />
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #D0D7DE", padding: "20px 24px" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>🛏️</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#57606A", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Room Recommendation</div>
                <div style={{ fontSize: 13, color: "#0D1117", lineHeight: 1.5 }}>{result.analysis.roomRecommendation}</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #D0D7DE", padding: "20px 24px" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>🎁</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#57606A", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Personalized Offer</div>
                <div style={{ fontSize: 13, color: "#0D1117", lineHeight: 1.5 }}>{result.analysis.personalizedOffer}</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #D0D7DE", padding: "20px 24px" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>📝</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#57606A", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Staff Note</div>
                <div style={{ fontSize: 13, color: "#0D1117", lineHeight: 1.5 }}>{result.analysis.staffNote}</div>
              </div>
            </div>

            {result.analysis.keywords.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #D0D7DE", padding: "20px 24px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0D1117", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Keywords Detected ({result.analysis.keywords.length})
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.analysis.keywords.map(kw => (
                    <span key={kw} style={{
                      padding: "4px 12px", borderRadius: 20,
                      background: "#F6F8FA", border: "1px solid #D0D7DE",
                      fontSize: 12, color: "#57606A",
                    }}>{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}