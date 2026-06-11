import React from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import "./index.css";

import GuestLookup from "./pages/GuestLookup";
import BatchProcess from "./pages/BatchProcess";
import PreferenceForm from "./pages/PreferenceForm";
import Dashboard from "./pages/Dashboard";

/* ── SVG Icons ─────────────────────────────────────────────── */
const SearchIcon = () => <span>🔍</span>;
const BatchIcon = () => <span>📁</span>;
const PreferenceIcon = () => <span>⚙️</span>;
const DashboardIcon = () => <span>📊</span>;
const HotelIcon = () => <span>🏨</span>;

/* ── Nav Config ────────────────────────────────────────────── */
const NAV_ITEMS = [
  { path: "/", label: "Guest Lookup", Icon: SearchIcon, desc: "Search by email" },
  { path: "/batch", label: "Batch Processing", Icon: BatchIcon, desc: "Upload CSV file" },
  { path: "/preference", label: "Guest Preferences", Icon: PreferenceIcon, desc: "Manage form" },
  { path: "/dashboard", label: "Dashboard", Icon: DashboardIcon, desc: "Analytics" },
];

/* ── Sidebar ────────────────────────────────────────────────── */
function Sidebar() {
  const loc = useLocation();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <HotelIcon />
        </div>

        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Hospitality</span>
          <span className="sidebar-brand-sub">Intelligence Suite</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Main Menu</p>

        {NAV_ITEMS.map(({ path, label, Icon, desc }) => {
          const active =
            loc.pathname === path ||
            (path !== "/" && loc.pathname.startsWith(path));

          return (
            <NavLink
              key={path}
              to={path}
              style={{ textDecoration: "none" }}
            >
              <div
                className={`sidebar-item${
                  active ? " sidebar-item--active" : ""
                }`}
              >
                <span className="sidebar-item-icon">
                  <Icon />
                </span>

                <div className="sidebar-item-text">
                  <span className="sidebar-item-label">{label}</span>
                  <span className="sidebar-item-desc">{desc}</span>
                </div>

                {active && <div className="sidebar-item-dot" />}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="sidebar-status-dot" />
          <span className="sidebar-status-text">System Online</span>
        </div>

        <div className="sidebar-version">
          AI &amp; NLP · v1.0.0 · Node.js + React
        </div>
      </div>
    </aside>
  );
}

/* ── Layout ─────────────────────────────────────────────────── */
function Layout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--bg-app)",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <main
        style={{
          marginLeft: "var(--sidebar-width)",
          flex: 1,
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}

/* ── App ────────────────────────────────────────────────────── */
export default function App() {
  if (window.location.pathname === "/preferences") {
    return <PreferenceForm />;
  }

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