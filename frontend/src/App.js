import React from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import "./index.css";
import GuestLookup from "./pages/GuestLookup";
import BatchProcess from "./pages/BatchProcess";
import PreferenceForm from "./pages/PreferenceForm";
import Dashboard from "./pages/Dashboard";

/* ── SVG Icons ─────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const BatchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const PreferenceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const HotelIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

/* ── Nav Config ────────────────────────────────────────────── */
const NAV_ITEMS = [
  { path: "/",           label: "Guest Lookup",      Icon: SearchIcon,     desc: "Search by email"  },
  { path: "/batch",      label: "Batch Processing",  Icon: BatchIcon,      desc: "Upload CSV file"  },
  { path: "/preference", label: "Guest Preferences", Icon: PreferenceIcon, desc: "Manage form"      },
  { path: "/dashboard",  label: "Dashboard",         Icon: DashboardIcon,  desc: "Analytics"        },
];

/* ── Sidebar ────────────────────────────────────────────────── */
function Sidebar() {
  const loc = useLocation();
  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo"><HotelIcon /></div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Hospitality</span>
          <span className="sidebar-brand-sub">Intelligence Suite</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Main Menu</p>
        {NAV_ITEMS.map(({ path, label, Icon, desc }) => {
          const active = loc.pathname === path || (path !== "/" && loc.pathname.startsWith(path));
          return (
            <NavLink key={path} to={path} style={{ textDecoration: "none" }}>
              <div className={`sidebar-item${active ? " sidebar-item--active" : ""}`}>
                <span className="sidebar-item-icon"><Icon /></span>
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
        <div className="sidebar-version">AI &amp; NLP · v1.0.0 · Node.js + React</div>
      </div>

    </aside>
  );
}

/* ── Layout ─────────────────────────────────────────────────── */
function Layout({ children }) {
  return (
    <div style={{ display: "flex", background: "var(--bg-app)", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ marginLeft: "var(--sidebar-width)", flex: 1, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}

/* ── App ────────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"           element={<GuestLookup />}   />
          <Route path="/batch"      element={<BatchProcess />}  />
          <Route path="/preference" element={<PreferenceForm />}/>
          <Route path="/dashboard"  element={<Dashboard />}     />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
