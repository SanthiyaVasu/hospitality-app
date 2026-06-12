import React, { useState } from "react";
import axios from "axios";

const API = "https://hospitality-backend-w17q.onrender.com";

const C = {
  bg:"#F5F4F0",surface:"#FFFFFF",border:"#E2E0DA",borderDark:"#C8C5BC",
  text:"#1C1917",textMid:"#57534E",textMute:"#A8A29E",fill:"#1C1917",
  tag:"#F0EEE9",tagBorder:"#DDD9D3",divider:"#EDEBE5",inputBg:"#FAFAF8",
};

const PERSONA_THEME = {
  luxury:    {bg1:"#1a1208",bg2:"#3d2b0e",accent:"#c9a84c",label:"LUXURY"},
  business:  {bg1:"#0d1520",bg2:"#1a2d42",accent:"#5b8fc9",label:"BUSINESS"},
  leisure:   {bg1:"#0d1f18",bg2:"#163325",accent:"#4caf7d",label:"LEISURE"},
  adventure: {bg1:"#1a0e06",bg2:"#3d2010",accent:"#d4693a",label:"ADVENTURE"},
  family:    {bg1:"#0f1625",bg2:"#1e2d4a",accent:"#7b9fd4",label:"FAMILY"},
  food:      {bg1:"#1a0808",bg2:"#3d1010",accent:"#d45b5b",label:"DINING"},
  eco:       {bg1:"#0a1a0d",bg2:"#14321a",accent:"#5bbf6e",label:"ECO"},
  arts:      {bg1:"#16091a",bg2:"#2d1035",accent:"#a06cc9",label:"ARTS"},
  sports:    {bg1:"#0d1a0d",bg2:"#1a3318",accent:"#6cbf5b",label:"SPORTS"},
  default:   {bg1:"#111111",bg2:"#2a2a2a",accent:"#aaaaaa",label:"EXCLUSIVE"},
};

const PERSONA_TAGLINES = {
  luxury:    "Where Royalty Meets Comfort",
  business:  "Your Office Away From Office",
  leisure:   "Relax. Recharge. Explore.",
  adventure: "Nature Awaits You",
  family:    "Every Moment. Every Memory.",
  food:      "Where Every Meal Is An Experience",
  eco:       "Stay Green. Live Well.",
  arts:      "Culture. Art. Soul.",
  sports:    "Train Hard. Rest Well.",
  default:   "Your Perfect Stay Awaits",
};

function trunc(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function HotelAdPoster({ guestName, persona, meta, analysis, variant, hotelRecommendations }) {
  const firstName  = (guestName || "Guest").split(" ")[0];
  const personaKey = (persona || "").toLowerCase().replace(" traveler", "").trim();
  const theme      = PERSONA_THEME[personaKey] || PERSONA_THEME.default;
  const tagline    = PERSONA_TAGLINES[personaKey] || PERSONA_TAGLINES.default;
  const location   = meta?.location || "Your City";
  const spending   = meta?.spendingLevel || "";
  const hotels     = hotelRecommendations || [];
  const hotelData  = hotels[variant - 1] || hotels[0];
  const hotelName  = hotelData?.name || "Premium Hotel";
  const hotelAddr  = hotelData?.address && hotelData.address !== location ? hotelData.address : location;

  const variants = {
    1: { greeting:`Hey ${firstName},`, headline1:"We Found Your", headline2:"Perfect Hotel.", hotelName, tagline, offer:trunc(analysis?.personalizedOffer||"Exclusive welcome package awaits you",52), cta:"Claim Your Offer", badge:theme.label },
    2: { greeting:`${firstName}, You Deserve`, headline1:"The Best Room", headline2:"In The House.", hotelName, tagline:trunc(analysis?.roomRecommendation||tagline,44), offer:trunc(analysis?.staffNote||"Our staff is ready to make your stay unforgettable",52), cta:"Book Your Room", badge:spending?spending.toUpperCase():theme.label },
    3: { greeting:"Exclusively For You,", headline1:firstName+",", headline2:"Your Stay Is Ready.", hotelName, tagline, offer:trunc(analysis?.personalizedOffer||"Special offer crafted just for your profile",52), cta:"View Special Offer", badge:"PERSONALISED" },
  };
  const v = variants[variant] || variants[1];

  return (
    <svg viewBox="0 0 440 260" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", borderRadius:10, display:"block" }}>
      <defs>
        <linearGradient id={`bg_${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.bg1}/><stop offset="100%" stopColor={theme.bg2}/>
        </linearGradient>
        <linearGradient id={`shine_${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.06"/><stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </linearGradient>
        <clipPath id={`clip_${variant}`}><rect width="440" height="260" rx="10"/></clipPath>
      </defs>
      <g clipPath={`url(#clip_${variant})`}>
        <rect width="440" height="260" fill={`url(#bg_${variant})`}/>
        <rect width="440" height="260" fill={`url(#shine_${variant})`}/>
        <circle cx="380" cy="130" r="130" fill={theme.accent} opacity="0.06"/>
        <circle cx="400" cy="50"  r="60"  fill={theme.accent} opacity="0.05"/>
        <circle cx="60"  cy="220" r="80"  fill={theme.accent} opacity="0.04"/>
        <rect x="0" y="0" width="5" height="260" fill={theme.accent} opacity="0.9"/>
        <rect x="310" y="14" width="112" height="20" rx="4" fill={theme.accent} opacity="0.15"/>
        <text x="366" y="27" fontSize="9" fontWeight="700" fill={theme.accent} fontFamily="'DM Sans','Helvetica Neue',sans-serif" textAnchor="middle" letterSpacing="0.12em" opacity="0.9">{v.badge}</text>
        <text x="18" y="56" fontSize="11" fontWeight="500" fill={theme.accent} fontFamily="'DM Sans','Helvetica Neue',sans-serif" opacity="0.85" fontStyle="italic">{v.greeting}</text>
        <text x="18" y="82" fontSize="22" fontWeight="800" fill="#ffffff" fontFamily="'DM Sans','Helvetica Neue',sans-serif" letterSpacing="-0.5px">{v.headline1}</text>
        <text x="18" y="108" fontSize="22" fontWeight="800" fill={theme.accent} fontFamily="'DM Sans','Helvetica Neue',sans-serif" letterSpacing="-0.5px">{v.headline2}</text>
        <line x1="18" y1="120" x2="220" y2="120" stroke={theme.accent} strokeWidth="0.6" opacity="0.3"/>
        <text x="18" y="138" fontSize="13" fontWeight="700" fill="#ffffff" fontFamily="'DM Sans','Helvetica Neue',sans-serif" opacity="0.95">{trunc(v.hotelName,36)}</text>
        <text x="18" y="153" fontSize="10" fontWeight="400" fill="#ffffff" fontFamily="'DM Sans','Helvetica Neue',sans-serif" opacity="0.5" fontStyle="italic">{trunc(v.tagline,44)}</text>
        <rect x="18" y="163" width="268" height="42" rx="6" fill="#ffffff" opacity="0.06"/>
        <text x="28" y="177" fontSize="8" fontWeight="700" fill={theme.accent} fontFamily="'DM Sans','Helvetica Neue',sans-serif" letterSpacing="0.1em" opacity="0.8">SPECIAL OFFER</text>
        <text x="28" y="191" fontSize="9.5" fill="#ffffff" fontFamily="'DM Sans','Helvetica Neue',sans-serif" opacity="0.75">{trunc(v.offer,46)}</text>
        <text x="18" y="222" fontSize="9" fontWeight="500" fill="#ffffff" fontFamily="'DM Sans','Helvetica Neue',sans-serif" opacity="0.55" letterSpacing="0.05em">📍 {trunc(hotelAddr,28)}</text>
        <rect x="308" y="218" width="116" height="30" rx="6" fill={theme.accent} opacity="0.95"/>
        <text x="366" y="237" fontSize="10" fontWeight="700" fill={theme.bg1} fontFamily="'DM Sans','Helvetica Neue',sans-serif" textAnchor="middle" letterSpacing="0.03em">{v.cta} →</text>
        <rect x="0" y="255" width="440" height="5" fill={theme.accent} opacity="0.2"/>
      </g>
    </svg>
  );
}

function downloadSVG(svgEl, filename) {
  const str = new XMLSerializer().serializeToString(svgEl);
  const url = URL.createObjectURL(new Blob([str], { type:"image/svg+xml" }));
  const a   = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Ad Posters with Email Send ────────────────────────────────
function AdPosters({ persona, guestName, guestEmail, meta, analysis, hotelRecommendations }) {
  const [selected,    setSelected]    = useState(null);
  const [sending,     setSending]     = useState(false);
  const [sendStatus,  setSendStatus]  = useState(null); // "success" | "error" | null
  const [sendMsg,     setSendMsg]     = useState("");
  const refs = { 1:React.createRef(), 2:React.createRef(), 3:React.createRef() };

  if (!persona) return null;

  const labels = {
    1: { title:"Welcome Offer",        desc:"Personalised welcome with hotel recommendation" },
    2: { title:"Room Recommendation",  desc:"Best room match based on guest profile" },
    3: { title:"Exclusive Deal",       desc:"Special offer crafted for this guest" },
  };

  // ── Get SVG string of selected variant ───────────────────
  function getSelectedSVG() {
    if (!selected) return null;
    const svgEl = refs[selected].current?.querySelector("svg");
    if (!svgEl) return null;
    return new XMLSerializer().serializeToString(svgEl);
  }

  // ── Send email with ad + QR ───────────────────────────────
  async function handleSendEmail() {
    if (!selected) { setSendStatus("error"); setSendMsg("Please select an ad variant first."); return; }
    if (!guestEmail) { setSendStatus("error"); setSendMsg("Guest email not available."); return; }

    const svgString = getSelectedSVG();
    const formUrl   = "https://hospitality-app-39zz.onrender.com/preferences?" +
      "name="  + encodeURIComponent(guestName)  + "&" +
      "email=" + encodeURIComponent(guestEmail);

    setSending(true); setSendStatus(null); setSendMsg("");

    try {
      await axios.post(`${API}/api/email/send-ad`, {
  guestName,
  guestEmail,
  persona,
  variantLabel:  labels[selected].title,
  svgString,
  formUrl,
  offer:         analysis?.personalizedOffer || "",
  roomRec:       analysis?.roomRecommendation || "",
}, { timeout: 30000 }); // 30 seconds timeout
      setSendStatus("success");
      setSendMsg("Email sent successfully to " + guestEmail);
    } catch (err) {
      setSendStatus("error");
      setSendMsg(err.response?.data?.error || "Failed to send email. Please try again.");
    } finally { setSending(false); }
  }

  return (
    <div style={{ background:C.surface, borderRadius:10, border:`1px solid ${C.border}`, padding:"22px 26px", marginBottom:18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
        <span style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.09em" }}>
          Hotel Ad Creatives — 3 Variants
        </span>
        <span style={{ marginLeft:"auto", fontSize:10, color:C.textMute, background:C.tag, padding:"2px 8px", borderRadius:4, border:`1px solid ${C.tagBorder}` }}>
          {(persona || "").replace(" Traveler", "")}
        </span>
      </div>
      <p style={{ fontSize:12, color:C.textMute, marginBottom:20 }}>
        Personalised hotel advertisement posters generated from this guest's profile. Select one and send directly to guest's email.
      </p>

      {/* 3 Ad Poster Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {[1,2,3].map(v => (
          <div key={v}
            style={{ borderRadius:10, overflow:"hidden", border:`2px solid ${selected===v ? C.text : C.border}`, cursor:"pointer", transition:"border-color 0.15s" }}
            onClick={() => setSelected(selected === v ? null : v)}>
            <div ref={refs[v]}>
              <HotelAdPoster variant={v} guestName={guestName} persona={persona} meta={meta} analysis={analysis} hotelRecommendations={hotelRecommendations} />
            </div>
            <div style={{ padding:"12px 14px", background:C.bg, borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:3 }}>{labels[v].title}</div>
              <div style={{ fontSize:11, color:C.textMute, marginBottom:10 }}>{labels[v].desc}</div>
              <div style={{ display:"flex", gap:8 }}>
                <button
                  onClick={e => { e.stopPropagation(); setSelected(selected === v ? null : v); }}
                  style={{ flex:1, padding:"6px 0", fontSize:11, fontWeight:600, borderRadius:5, border:`1px solid ${C.border}`, background:selected===v ? C.fill : C.surface, color:selected===v ? "#fff" : C.textMid, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                  {selected === v ? "✓ Selected" : "Select"}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); const svgEl = refs[v].current?.querySelector("svg"); if (svgEl) downloadSVG(svgEl, `hotel_ad_v${v}_${(guestName||"guest").replace(/\s+/g,"_").toLowerCase()}.svg`); }}
                  style={{ padding:"6px 12px", fontSize:11, fontWeight:600, borderRadius:5, border:`1px solid ${C.border}`, background:C.surface, color:C.textMid, cursor:"pointer", fontFamily:"inherit" }}>
                  ↓ Save
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Send to Guest Panel */}
      <div style={{ marginTop:16, padding:"16px 18px", background:C.bg, borderRadius:8, border:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:3 }}>
              {selected ? `Variant ${selected} — ${labels[selected].title} selected` : "Select an ad variant above to send"}
            </div>
            <div style={{ fontSize:11, color:C.textMute }}>
              Email will include: selected ad poster + QR code + preference form link → sent to {guestEmail}
            </div>
          </div>
          <button
            onClick={handleSendEmail}
            disabled={sending || !selected}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 22px", borderRadius:7, border:"none", background: (!selected || sending) ? C.borderDark : C.fill, color:"#fff", fontSize:12, fontWeight:700, cursor:(!selected||sending)?"not-allowed":"pointer", fontFamily:"inherit", whiteSpace:"nowrap", opacity:(!selected||sending)?0.6:1, transition:"all 0.15s" }}>
            {sending ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation:"spin 0.9s linear infinite" }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> Sending...</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send to Guest</>
            )}
          </button>
        </div>

        {/* Status message */}
        {sendStatus && (
          <div style={{ marginTop:12, padding:"9px 12px", borderRadius:6, fontSize:12, fontWeight:500,
            background: sendStatus === "success" ? "#F0FDF4" : "#FEF2F2",
            border: `1px solid ${sendStatus === "success" ? "#BBF7D0" : "#FECACA"}`,
            color: sendStatus === "success" ? "#15803D" : "#DC2626",
            display:"flex", alignItems:"center", gap:7 }}>
            {sendStatus === "success"
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            }
            {sendMsg}
          </div>
        )}
      </div>
    </div>
  );
}

const Icon = {
  Search:   (s=15)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  User:     (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail:     (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Briefcase:(s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  MapPin:   (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Dollar:   (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Calendar: (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Award:    (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Building: (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><line x1="9" y1="7" x2="9.01" y2="7"/><line x1="15" y1="7" x2="15.01" y2="7"/></svg>,
  TrendUp:  (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Globe:    (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Layers:   (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Bed:      (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>,
  Gift:     (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  FileText: (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Tag:      (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  ExtLink:  (s=12)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Database: (s=13)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  Check:    (s=13)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Alert:    (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Loader:   (s=14)=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:"spin 0.9s linear infinite"}}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>,
};

const PLATFORM_CONFIG = {
  linkedin:{label:"LinkedIn"}, instagram:{label:"Instagram"}, twitter:{label:"Twitter / X"},
  github:{label:"GitHub"}, youtube:{label:"YouTube"}, reddit:{label:"Reddit"},
  tripadvisor:{label:"TripAdvisor"}, medium:{label:"Medium"},
};

function Card({ children, style={} }) {
  return <div style={{ background:C.surface, borderRadius:10, border:`1px solid ${C.border}`, padding:"22px 26px", ...style }}>{children}</div>;
}

function SectionLabel({ icon, children, right }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:16 }}>
      <span style={{ color:C.textMute, display:"flex" }}>{icon}</span>
      <span style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.09em" }}>{children}</span>
      {right && <span style={{ marginLeft:"auto", fontSize:10, color:C.textMute, background:C.tag, padding:"2px 8px", borderRadius:4, border:`1px solid ${C.tagBorder}` }}>{right}</span>}
    </div>
  );
}

function MetaCell({ icon, label, value, sub }) {
  if (!value || value === "Unknown" || value === null || value === "null") return null;
  return (
    <div style={{ padding:"13px 14px", borderRadius:8, border:`1px solid ${C.border}`, background:C.bg }}>
      <span style={{ color:C.textMute, display:"flex", marginBottom:6 }}>{icon}</span>
      <div style={{ fontSize:10, fontWeight:700, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:600, color:C.text, lineHeight:1.4 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:C.textMute, marginTop:2 }}>via {sub}</div>}
    </div>
  );
}

function Divider() { return <div style={{ height:1, background:C.divider, margin:"14px 0" }}/>; }

function Pill({ children }) {
  return <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:4, fontSize:11, fontWeight:500, background:C.tag, color:C.textMid, border:`1px solid ${C.tagBorder}`, margin:"0 4px 4px 0" }}>{children}</span>;
}

function ScoreRow({ label, value }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, color:C.textMid, fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>{value}%</span>
      </div>
      <div style={{ height:5, background:C.tag, borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${value}%`, borderRadius:3, background:C.text, opacity:0.15+(value/100)*0.8, transition:"width 0.7s ease" }}/>
      </div>
    </div>
  );
}

function InputField({ label, icon, ...props }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</label>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:C.textMute, display:"flex" }}>{icon}</span>
        <input {...props} style={{ width:"100%", padding:"9px 12px 9px 35px", borderRadius:7, fontSize:13, border:`1px solid ${C.border}`, outline:"none", color:C.text, background:C.inputBg, fontFamily:"inherit", boxSizing:"border-box", transition:"all 0.15s" }}
          onFocus={e=>{ e.target.style.borderColor=C.text; e.target.style.boxShadow="0 0 0 3px rgba(28,25,23,0.07)"; e.target.style.background=C.surface; }}
          onBlur={e=> { e.target.style.borderColor=C.border; e.target.style.boxShadow="none"; e.target.style.background=C.inputBg; }}
        />
      </div>
    </div>
  );
}

function QRCodeSection({ guest }) {
  const [copied, setCopied] = useState(false);
  const formUrl = "https://hospitality-app-39zz.onrender.com/preferences?" +
    "name="  + encodeURIComponent(guest.name)  + "&" +
    "email=" + encodeURIComponent(guest.email);
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(formUrl);

  function copyLink() {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card style={{ marginBottom:18 }}>
      <SectionLabel icon={Icon.Tag()}>Guest Preference Form — QR Code</SectionLabel>
      <p style={{ fontSize:12, color:C.textMute, marginBottom:18, marginTop:-10 }}>
        Show this QR code to the guest. They scan it and fill their preferences — data saves automatically.
      </p>
      <div style={{ display:"flex", gap:32, alignItems:"flex-start" }}>
        <div style={{ flexShrink:0, padding:12, background:C.bg, borderRadius:10, border:`1px solid ${C.border}` }}>
          <img src={qrUrl} alt="QR Code" width={180} height={180} style={{ display:"block", borderRadius:6 }} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:12 }}>How it works</div>
          {["Guest scans QR code with their phone camera","Preference form opens pre-filled with name & email","Guest selects room type, amenities, activities","Data saves directly to your database"].map((s,i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:C.text, color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{i+1}</div>
              <span style={{ fontSize:12, color:C.textMid, lineHeight:1.5 }}>{s}</span>
            </div>
          ))}
          <Divider />
          <div style={{ fontSize:10, fontWeight:700, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Form Link</div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ flex:1, padding:"8px 12px", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, color:C.textMid, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{formUrl}</div>
            <button onClick={copyLink} style={{ padding:"8px 14px", borderRadius:6, border:`1px solid ${C.border}`, background:copied?C.fill:C.bg, color:copied?"#fff":C.textMid, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", transition:"all 0.15s" }}>
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <a href={formUrl} target="_blank" rel="noreferrer" style={{ padding:"8px 14px", borderRadius:6, border:`1px solid ${C.border}`, background:C.bg, color:C.textMid, fontSize:11, fontWeight:600, textDecoration:"none", whiteSpace:"nowrap" }}>Open</a>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function GuestLookup() {
  const [form,    setForm]    = useState({ name:"", email:"" });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");
  const [step,    setStep]    = useState("");

  const STEPS = [
    "Searching email across platforms...",
    "Querying Hunter.io & People Data Labs...",
    "Extracting profile metadata...",
    "Running NLP behavioural analysis...",
    "Generating guest intelligence report...",
    "Saving record to database...",
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true); setResult(null); setError("");
    let i = 0;
    const iv = setInterval(() => { i=(i+1)%STEPS.length; setStep(STEPS[i]); }, 2500);
    setStep(STEPS[0]);
    try {
      const res = await axios.post(`${API}/api/guest/lookup`, form);
      setResult(res.data);
    } catch(err) {
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally { clearInterval(iv); setLoading(false); setStep(""); }
  }

  const persona  = result?.analysis?.persona || "";
  const meta     = result?.metadata || result?.analysis?.metadata || null;
  const dq       = result?.analysis?.dataQuality;
  const analysis = result?.analysis || null;
  const hotels   = result?.hotelRecommendations || [];

  return (
    <div style={{ fontFamily:"'DM Sans','Helvetica Neue',sans-serif", background:C.bg, minHeight:"100vh", color:C.text }}>

      <div style={{ padding:"28px 40px 20px", borderBottom:`1px solid ${C.border}`, background:C.surface }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:C.text, letterSpacing:"-0.3px", marginBottom:3 }}>Guest Intelligence Lookup</h1>
        <p style={{ color:C.textMid, fontSize:13 }}>Enter a guest's name and email to generate a complete intelligence profile.</p>
      </div>

      <div style={{ padding:"24px 40px" }}>

        <Card style={{ marginBottom:18 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:14, alignItems:"end" }}>
              <InputField label="Guest Name"     icon={Icon.User()} type="text"  placeholder="e.g. Santhosh Kumar"    value={form.name}  onChange={e=>setForm(f=>({...f,name:e.target.value}))}  />
              <InputField label="Email Address"  icon={Icon.Mail()} type="email" placeholder="e.g. name@company.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
              <button type="submit" disabled={loading||!form.name||!form.email}
                style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 22px", borderRadius:7, border:"none", background:C.fill, color:"#fff", fontSize:13, fontWeight:600, cursor:(loading||!form.name||!form.email)?"not-allowed":"pointer", opacity:(loading||!form.name||!form.email)?0.5:1, fontFamily:"inherit", whiteSpace:"nowrap" }}>
                {loading ? <>{Icon.Loader()} Analysing...</> : <>{Icon.Search()} Analyse Guest</>}
              </button>
            </div>
          </form>
          {loading && (
            <div style={{ marginTop:14, padding:"10px 14px", background:C.bg, borderRadius:7, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:9 }}>
              <span style={{ color:C.textMute, display:"flex" }}>{Icon.Loader()}</span>
              <span style={{ fontSize:12, color:C.textMid }}>{step}</span>
            </div>
          )}
        </Card>

        {error && (
          <div style={{ padding:"11px 14px", background:C.bg, border:`1px solid ${C.borderDark}`, borderRadius:8, color:C.text, fontSize:13, marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color:C.textMid, display:"flex" }}>{Icon.Alert()}</span> {error}
          </div>
        )}

        {result && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>

            {/* Persona Banner */}
            <Card style={{ marginBottom:18, borderLeft:`3px solid ${C.text}`, paddingLeft:23 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:5 }}>Guest Persona</div>
                  <div style={{ fontSize:19, fontWeight:700, color:C.text, letterSpacing:"-0.2px" }}>{persona}</div>
                  <div style={{ fontSize:13, color:C.textMid, marginTop:3 }}>{result.guest.name}&nbsp;·&nbsp;{result.guest.email}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:7 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:5, background:C.tag, border:`1px solid ${C.border}` }}>
                    <span style={{ color:C.textMid, display:"flex" }}>{Icon.Check()}</span>
                    <span style={{ fontSize:11, fontWeight:600, color:C.textMid }}>{dq} Data Quality</span>
                  </div>
                  <div style={{ fontSize:11, color:C.textMute, display:"flex", alignItems:"center", gap:4 }}>
                    {Icon.Database()} Record #{result.guestId}
                  </div>
                </div>
              </div>
            </Card>

            {/* Guest Intelligence Profile */}
            {meta && (
              <Card style={{ marginBottom:18 }}>
                <SectionLabel icon={Icon.Layers()} right={meta.dataSource||"Search Snippets"}>Guest Intelligence Profile</SectionLabel>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
                  <MetaCell icon={Icon.User()}      label="Full Name"       value={meta.fullName}                                            sub={meta.dataSource} />
                  <MetaCell icon={Icon.Calendar()}  label="Age Estimate"    value={meta.age ? `${meta.age} years old` : meta.ageRange}        sub={meta.ageSource} />
                  <MetaCell icon={Icon.MapPin()}    label="Location"        value={meta.location}                                            sub={meta.locationSource} />
                  <MetaCell icon={Icon.Briefcase()} label="Job Title"       value={meta.profession||meta.jobTitle}                           sub={meta.dataSource} />
                  <MetaCell icon={Icon.Building()}  label="Company"         value={meta.company||meta.jobCompany}                            sub={meta.dataSource} />
                  <MetaCell icon={Icon.Award()}     label="Seniority"       value={meta.seniority||meta.jobSeniority}                        sub={meta.dataSource} />
                  <MetaCell icon={Icon.Globe()}     label="Industry"        value={meta.industry}                                            sub={meta.dataSource} />
                  <MetaCell icon={Icon.Dollar()}    label="Salary Estimate" value={meta.salary}                                              sub={meta.salarySource} />
                  <MetaCell icon={Icon.TrendUp()}   label="Experience"      value={meta.yearsExperience ? `${meta.yearsExperience} years` : null} sub={meta.dataSource} />
                </div>
                <Divider />
                <div style={{ display:"flex", flexWrap:"wrap", gap:16, alignItems:"center" }}>
                  {meta.travelFrequency && <div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ fontSize:10, fontWeight:700, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.07em" }}>Travel Frequency</span><Pill>{meta.travelFrequency}</Pill></div>}
                  {meta.spendingLevel   && <div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ fontSize:10, fontWeight:700, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.07em" }}>Spending Level</span><Pill>{meta.spendingLevel}</Pill></div>}
                </div>
                {meta.skills?.length > 0 && <><Divider /><div style={{ fontSize:10, fontWeight:700, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:9 }}>Skills</div><div>{meta.skills.map(s=><Pill key={s}>{s}</Pill>)}</div></>}
                {(meta.education?.length > 0 || meta.pastCompanies?.length > 0) && (
                  <><Divider />
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
                    {meta.education?.length > 0 && <div><div style={{ fontSize:10, fontWeight:700, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Education</div>{meta.education.map((e,i)=><div key={i} style={{ fontSize:12, color:C.textMid, padding:"5px 0", borderBottom:`1px solid ${C.divider}` }}>{e}</div>)}</div>}
                    {meta.pastCompanies?.length > 0 && <div><div style={{ fontSize:10, fontWeight:700, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Past Companies</div>{meta.pastCompanies.map((c,i)=><div key={i} style={{ fontSize:12, color:C.textMid, padding:"5px 0", borderBottom:`1px solid ${C.divider}` }}>{c}</div>)}</div>}
                  </div></>
                )}
                {meta.lifestyle?.length > 0 && <><Divider /><div style={{ fontSize:10, fontWeight:700, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:9 }}>Lifestyle Signals</div><div>{meta.lifestyle.map(l=><Pill key={l}>{l}</Pill>)}</div></>}
              </Card>
            )}

            {/* Social Profiles + Behaviour Scores */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
              <Card>
                <SectionLabel icon={Icon.Globe()}>Social Profiles ({Object.keys(result.profiles).length})</SectionLabel>
                {Object.keys(result.profiles).length === 0
                  ? <p style={{ color:C.textMute, fontSize:13 }}>No public profiles found.</p>
                  : Object.entries(result.profiles).map(([platform, url]) => {
                    const p = PLATFORM_CONFIG[platform] || { label:platform };
                    return (
                      <div key={platform} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.divider}` }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background:C.text, flexShrink:0 }}/>
                          <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{p.label}</span>
                        </div>
                        <a href={url} target="_blank" rel="noreferrer" style={{ fontSize:11, color:C.textMid, textDecoration:"none", display:"flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:4, border:`1px solid ${C.border}`, background:C.bg }}>
                          View {Icon.ExtLink()}
                        </a>
                      </div>
                    );
                  })
                }
                {result.scrapedPlatforms?.length > 0 && (
                  <div style={{ marginTop:12, padding:"7px 10px", background:C.bg, borderRadius:5, fontSize:11, color:C.textMid, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:5 }}>
                    {Icon.Check()} Scraped: {result.scrapedPlatforms.join(", ")}
                  </div>
                )}
              </Card>
              <Card>
                <SectionLabel icon={Icon.TrendUp()}>Behaviour Scores</SectionLabel>
                {Object.entries(result.analysis.scores).map(([key,val]) => (
                  <ScoreRow key={key} label={key.charAt(0).toUpperCase()+key.slice(1)} value={val} />
                ))}
              </Card>
            </div>

            {/* Room / Offer / Staff Note */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:18, marginBottom:18 }}>
              {[
                { icon:Icon.Bed(),      label:"Room Recommendation", value:result.analysis.roomRecommendation },
                { icon:Icon.Gift(),     label:"Personalized Offer",   value:result.analysis.personalizedOffer },
                { icon:Icon.FileText(), label:"Staff Note",           value:result.analysis.staffNote },
              ].map(({ icon, label, value }) => (
                <Card key={label} style={{ marginBottom:0 }}>
                  <span style={{ color:C.textMute, display:"flex", marginBottom:8 }}>{icon}</span>
                  <div style={{ fontSize:10, fontWeight:700, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>{label}</div>
                  <div style={{ fontSize:13, color:C.text, lineHeight:1.65 }}>{value}</div>
                </Card>
              ))}
            </div>

            {/* Hotel Ad Posters with Email Send */}
            <AdPosters
              persona={persona}
              guestName={result.guest.name}
              guestEmail={result.guest.email}
              meta={meta}
              analysis={analysis}
              hotelRecommendations={hotels}
            />

            {/* QR Code */}
            <QRCodeSection guest={result.guest} />

            {/* Keywords */}
            {result.analysis.keywords?.length > 0 && (
              <Card>
                <SectionLabel icon={Icon.Tag()}>Keywords Detected ({result.analysis.keywords.length})</SectionLabel>
                <div>{result.analysis.keywords.map(kw => <Pill key={kw}>{kw}</Pill>)}</div>
              </Card>
            )}

          </div>
        )}
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin:0; padding:0; }
      `}</style>
    </div>
  );
}