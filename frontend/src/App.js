import React from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import "./index.css";
import GuestLookup from "./pages/GuestLookup";
import BatchProcess from "./pages/BatchProcess";
import PreferenceForm from "./pages/PreferenceForm";
import Dashboard from "./pages/Dashboard";

const NAV_ITEMS = [
  { path: "/", label: "Guest Lookup", icon: "🔍", desc: "Search by email" },
  { path: "/batch", label: "Batch Processing", icon: "📂", desc: "Upload CSV" },
  { path: "/preference", label: "Guest Preferences", icon: "📋", desc: "Guest form" },
  { path: "/dashboard", label: "Dashboard", icon: "📊", desc: "Analytics" },
];

function Sidebar() {
  const loc = useLocation();
  return (
    <aside style={{
      width: 240,
      background: "#0D1117",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #B8860B, #D4A017)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
          }}>🏨</div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", color: "#fff", fontSize: 15, lineHeight: 1.2 }}>Hospitality</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", color: "#D4A017", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" }}>Intelligence</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {NAV_ITEMS.map((item) => {
          const active = loc.pathname === item.path || (item.path !== "/" && loc.pathname.startsWith(item.path));
          return (
            <NavLink key={item.path} to={item.path} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 10, marginBottom: 4,
                background: active ? "rgba(184,134,11,0.15)" : "transparent",
                border: active ? "1px solid rgba(184,134,11,0.3)" : "1px solid transparent",
                cursor: "pointer",
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ color: active ? "#F5E6C3" : "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{item.label}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{item.desc}</div>
                </div>
                {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#D4A017", flexShrink: 0 }} />}
              </div>
            </NavLink>
          );
        })}
      </nav>
      <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
          Powered by AI & NLP<br /><span style={{ color: "rgba(255,255,255,0.15)" }}>v1.0.0 · Node.js + React</span>
        </div>
      </div>
    </aside>
  );
}

function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, minHeight: "100vh", background: "#F6F8FA" }}>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<GuestLookup />} />
          <Route path="/batch" element={<BatchProcess />} />
          <Route path="/preference" element={<PreferenceForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}