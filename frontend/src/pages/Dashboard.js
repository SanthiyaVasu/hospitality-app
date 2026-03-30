import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const API = "https://hospitality-app-39zz.onrender.com";

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ padding: "36px 40px 24px", borderBottom: "1px solid #D0D7DE", background: "#fff" }}>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#0D1117", marginBottom: 4 }}>{title}</h1>
      <p style={{ color: "#57606A", fontSize: 14 }}>{subtitle}</p>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #D0D7DE",
      padding: "20px 24px", display: "flex", alignItems: "center", gap: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: color, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#8B949E", fontWeight: 500, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

const PIE_COLORS = ["#D97706","#2563EB","#16A34A","#EA580C","#9333EA","#E11D48","#0284C7","#15803D","#C2410C","#059669"];

const PERSONA_ICONS = {
  "Luxury Traveler": "💎", "Business Traveler": "💼", "Leisure Traveler": "🌴",
  "Adventure Traveler": "🧗", "Family Traveler": "👨‍👩‍👧", "Food Traveler": "🍽️",
  "Tech Traveler": "💻", "Eco Traveler": "🌿", "Arts Traveler": "🎨", "Sports Traveler": "⚽",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [s, g] = await Promise.all([
          axios.get(`${API}/api/db/stats`),
          axios.get(`${API}/api/guest/all`),
        ]);
        setStats(s.data);
        setGuests(g.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = guests.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.email_local?.toLowerCase().includes(search.toLowerCase()) ||
    g.persona?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <PageHeader title="Analytics Dashboard" subtitle="Real-time overview of all guest intelligence data." />
        <div style={{ padding: "40px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 14 }} />)}
        </div>
      </div>
    );
  }

  const pieData = (stats?.personaBreakdown || []).map((p, i) => ({
    name: p.persona, value: parseInt(p.count), color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const barData = (stats?.personaBreakdown || []).map(p => ({
    persona: p.persona?.replace(" Traveler", ""),
    count: parseInt(p.count),
  }));

  return (
    <div>
      <PageHeader title="Analytics Dashboard" subtitle="Real-time overview of all guest intelligence data." />
      <div style={{ padding: "32px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          <StatCard icon="👥" label="Total Guests" value={stats?.guests || 0} color="#0D1117" bg="#F6F8FA" />
          <StatCard icon="🔗" label="Social Profiles" value={stats?.socialProfiles || 0} color="#2563EB" bg="#EFF6FF" />
          <StatCard icon="🧠" label="AI Analysed" value={stats?.analysed || 0} color="#16A34A" bg="#F0FDF4" />
          <StatCard icon="📋" label="Preferences Saved" value={stats?.preferences || 0} color="#D97706" bg="#FEF3C7" />
        </div>

        {pieData.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #D0D7DE", padding: "24px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0D1117", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 20 }}>
                Guest Persona Distribution
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barSize={28}>
                  <XAxis dataKey="persona" tick={{ fontSize: 10, fill: "#8B949E" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#8B949E" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #D0D7DE", fontSize: 12 }} cursor={{ fill: "#F6F8FA" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {barData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #D0D7DE", padding: "24px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0D1117", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 20 }}>
                Persona Share
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #D0D7DE", fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #D0D7DE", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #D0D7DE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0D1117", textTransform: "uppercase", letterSpacing: 0.5 }}>
              All Guests ({filtered.length})
            </div>
            <input
              type="text" placeholder="Search guests..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 13,
                border: "1.5px solid #D0D7DE", outline: "none", color: "#0D1117",
                fontFamily: "'DM Sans', sans-serif", width: 220,
              }}
              onFocus={e => e.target.style.borderColor = "#B8860B"}
              onBlur={e => e.target.style.borderColor = "#D0D7DE"}
            />
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "#8B949E" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14 }}>{guests.length === 0 ? "No guests analysed yet. Use Guest Lookup to get started." : "No guests match your search."}</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F6F8FA" }}>
                    {["Guest", "Email", "Persona", "Profiles", "Data Quality", "Room Recommendation", "Date"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#57606A", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g, i) => (
                    <tr key={g.id} style={{ borderTop: "1px solid #E8ECF0", background: i % 2 === 0 ? "#fff" : "#FAFBFC" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0D1117" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                            background: "linear-gradient(135deg, #B8860B, #D4A017)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: 12,
                          }}>{g.name?.[0]?.toUpperCase() || "?"}</div>
                          {g.name}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#57606A" }}>{g.email_local}@{g.email_domain}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {g.persona ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#0D1117" }}>
                            {PERSONA_ICONS[g.persona] || "👤"} {g.persona}
                          </span>
                        ) : <span style={{ color: "#8B949E" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#EFF6FF", color: "#2563EB" }}>{g.profile_count || 0}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {g.data_quality ? (
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: g.data_quality === "High" ? "#D1FAE5" : g.data_quality === "Medium" ? "#FEF3C7" : "#F3F4F6",
                            color: g.data_quality === "High" ? "#065F46" : g.data_quality === "Medium" ? "#92400E" : "#374151",
                          }}>{g.data_quality}</span>
                        ) : <span style={{ color: "#8B949E" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#57606A", fontSize: 12, maxWidth: 200 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.room_recommendation || "—"}</div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#8B949E", fontSize: 12, whiteSpace: "nowrap" }}>
                        {g.created_at ? new Date(g.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}