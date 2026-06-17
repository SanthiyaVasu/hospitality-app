import React, { useState, useCallback, useRef } from "react";
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
  luxury:"Where Royalty Meets Comfort", business:"Your Office Away From Office",
  leisure:"Relax. Recharge. Explore.", adventure:"Nature Awaits You",
  family:"Every Moment. Every Memory.", food:"Where Every Meal Is An Experience",
  eco:"Stay Green. Live Well.", arts:"Culture. Art. Soul.",
  sports:"Train Hard. Rest Well.", default:"Your Perfect Stay Awaits",
};

function trunc(str, max) { if (!str) return ""; return str.length > max ? str.slice(0, max - 1) + "…" : str; }

// ── SVG Ad Poster (same as GuestLookup) ───────────────────────
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
        <linearGradient id={`bbg_${variant}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={theme.bg1}/><stop offset="100%" stopColor={theme.bg2}/></linearGradient>
        <linearGradient id={`bsh_${variant}`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ffffff" stopOpacity="0.06"/><stop offset="100%" stopColor="#ffffff" stopOpacity="0"/></linearGradient>
        <clipPath id={`bcl_${variant}`}><rect width="440" height="260" rx="10"/></clipPath>
      </defs>
      <g clipPath={`url(#bcl_${variant})`}>
        <rect width="440" height="260" fill={`url(#bbg_${variant})`}/>
        <rect width="440" height="260" fill={`url(#bsh_${variant})`}/>
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

// ── Ad Posters + Send to Guest (same logic as GuestLookup) ────
function AdPosters({ persona, guestName, guestEmail, meta, analysis, hotelRecommendations }) {
  const [selected,   setSelected]   = useState(null);
  const [sending,    setSending]    = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [sendMsg,    setSendMsg]    = useState("");
  const refs = { 1:React.createRef(), 2:React.createRef(), 3:React.createRef() };

  if (!persona) return null;

  const labels = {
    1: { title:"Welcome Offer",       desc:"Personalised welcome with hotel recommendation" },
    2: { title:"Room Recommendation", desc:"Best room match based on guest profile" },
    3: { title:"Exclusive Deal",      desc:"Special offer crafted for this guest" },
  };

  function getSelectedSVG() {
    if (!selected) return null;
    const svgEl = refs[selected].current?.querySelector("svg");
    return svgEl ? new XMLSerializer().serializeToString(svgEl) : null;
  }

  async function handleSendEmail() {
    if (!selected)   { setSendStatus("error"); setSendMsg("Please select an ad variant first."); return; }
    if (!guestEmail) { setSendStatus("error"); setSendMsg("Guest email not available."); return; }

    const svgString = getSelectedSVG();
    const formUrl = "https://hospitality-app-39zz.onrender.com/preferences?" +
      "name="  + encodeURIComponent(guestName)  + "&" +
      "email=" + encodeURIComponent(guestEmail);

    setSending(true); setSendStatus(null); setSendMsg("");
    try {
      await axios.post(`${API}/api/email/send-ad`, {
        guestName, guestEmail, persona,
        variantLabel: labels[selected].title,
        svgString, formUrl,
        offer:   analysis?.personalizedOffer  || "",
        roomRec: analysis?.roomRecommendation || "",
      });
      setSendStatus("success");
      setSendMsg("Email sent to " + guestEmail);
    } catch (err) {
      setSendStatus("error");
      setSendMsg(err.response?.data?.error || "Failed to send email.");
    } finally { setSending(false); }
  }

  return (
    <div style={{ marginTop:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
        <span style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.09em" }}>Hotel Ad Creatives — 3 Variants</span>
        <span style={{ marginLeft:"auto", fontSize:10, color:C.textMute, background:C.tag, padding:"2px 8px", borderRadius:4, border:`1px solid ${C.tagBorder}` }}>{(persona||"").replace(" Traveler","")}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginTop:12 }}>
        {[1,2,3].map(v => (
          <div key={v} style={{ borderRadius:10, overflow:"hidden", border:`2px solid ${selected===v?C.text:C.border}`, cursor:"pointer" }} onClick={() => setSelected(selected===v?null:v)}>
            <div ref={refs[v]}><HotelAdPoster variant={v} guestName={guestName} persona={persona} meta={meta} analysis={analysis} hotelRecommendations={hotelRecommendations} /></div>
            <div style={{ padding:"10px 12px", background:C.bg, borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:2 }}>{labels[v].title}</div>
              <div style={{ fontSize:11, color:C.textMute, marginBottom:8 }}>{labels[v].desc}</div>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={e=>{e.stopPropagation();setSelected(selected===v?null:v);}} style={{ flex:1, padding:"5px 0", fontSize:11, fontWeight:600, borderRadius:5, border:`1px solid ${C.border}`, background:selected===v?C.fill:C.surface, color:selected===v?"#fff":C.textMid, cursor:"pointer", fontFamily:"inherit" }}>
                  {selected===v ? "✓ Selected" : "Select"}
                </button>
                <button onClick={e=>{e.stopPropagation(); const svgEl=refs[v].current?.querySelector("svg"); if(svgEl) downloadSVG(svgEl,`ad_v${v}_${(guestName||"guest").replace(/\s+/g,"_").toLowerCase()}.svg`);}} style={{ padding:"5px 10px", fontSize:11, fontWeight:600, borderRadius:5, border:`1px solid ${C.border}`, background:C.surface, color:C.textMid, cursor:"pointer", fontFamily:"inherit" }}>↓</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:12, padding:"12px 14px", background:C.bg, borderRadius:8, border:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div style={{ fontSize:11, color:C.textMute }}>{selected ? `Variant ${selected} selected — ready to send to ${guestEmail}` : "Select a variant above to send"}</div>
          <button onClick={handleSendEmail} disabled={sending||!selected}
            style={{ padding:"7px 16px", borderRadius:6, border:"none", background:(!selected||sending)?C.borderDark:C.fill, color:"#fff", fontSize:11, fontWeight:700, cursor:(!selected||sending)?"not-allowed":"pointer", fontFamily:"inherit", opacity:(!selected||sending)?0.6:1 }}>
            {sending ? "Sending..." : "Send to Guest"}
          </button>
        </div>
        {sendStatus && (
          <div style={{ marginTop:8, padding:"7px 10px", borderRadius:5, fontSize:11, fontWeight:500, background:sendStatus==="success"?"#F0FDF4":"#FEF2F2", border:`1px solid ${sendStatus==="success"?"#BBF7D0":"#FECACA"}`, color:sendStatus==="success"?"#15803D":"#DC2626" }}>
            {sendMsg}
          </div>
        )}
      </div>
    </div>
  );
}

// ── QR Code Section (same as GuestLookup) ─────────────────────
function QRCodeSection({ guest }) {
  const [copied, setCopied] = useState(false);
  const formUrl = "https://hospitality-app-39zz.onrender.com/preferences?" +
    "name="  + encodeURIComponent(guest.name)  + "&" +
    "email=" + encodeURIComponent(guest.email);
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=" + encodeURIComponent(formUrl);

  function copyLink() { navigator.clipboard.writeText(formUrl); setCopied(true); setTimeout(()=>setCopied(false),2000); }

  return (
    <div style={{ marginTop:16, padding:"14px 16px", background:C.bg, borderRadius:8, border:`1px solid ${C.border}`, display:"flex", gap:16, alignItems:"center" }}>
      <img src={qrUrl} alt="QR Code" width={90} height={90} style={{ borderRadius:6, flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:4 }}>Guest Preference Form QR</div>
        <div style={{ fontSize:11, color:C.textMute, marginBottom:8 }}>Guest scans to fill room, dietary and activity preferences.</div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={copyLink} style={{ padding:"5px 12px", borderRadius:5, border:`1px solid ${C.border}`, background:copied?C.fill:C.surface, color:copied?"#fff":C.textMid, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{copied?"Copied!":"Copy Link"}</button>
          <a href={formUrl} target="_blank" rel="noreferrer" style={{ padding:"5px 12px", borderRadius:5, border:`1px solid ${C.border}`, background:C.surface, color:C.textMid, fontSize:11, fontWeight:600, textDecoration:"none" }}>Open</a>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }) {
  if (!value || value === "Unknown") return null;
  return (
    <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${C.divider}`, fontSize:12 }}>
      <span style={{ color:C.textMute }}>{label}</span>
      <span style={{ color:C.text, fontWeight:600 }}>{value}</span>
    </div>
  );
}

// ── Single Guest Card — full breakdown, collapsible ────────────
function GuestResultCard({ result, index }) {
  const [expanded, setExpanded] = useState(false);

  if (result.status === "failed") {
    return (
      <div style={{ background:C.surface, borderRadius:10, border:`1px solid ${C.border}`, padding:"16px 20px", marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{result.guest.name}</div>
            <div style={{ fontSize:12, color:C.textMute }}>{result.guest.email}</div>
          </div>
          <span style={{ padding:"3px 10px", borderRadius:5, fontSize:11, fontWeight:600, background:"#FEF2F2", color:"#DC2626" }}>Failed</span>
        </div>
        <div style={{ fontSize:11, color:C.textMute, marginTop:8 }}>{result.error}</div>
      </div>
    );
  }

  const { guest, metadata, analysis, profiles, hotelRecommendations } = result;
  const persona = analysis?.persona || "";

  return (
    <div style={{ background:C.surface, borderRadius:10, border:`1px solid ${C.border}`, marginBottom:12, overflow:"hidden" }}>
      <div onClick={() => setExpanded(!expanded)} style={{ padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:26, height:26, borderRadius:"50%", background:C.tag, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:C.textMid }}>{index+1}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{guest.name}</div>
            <div style={{ fontSize:12, color:C.textMute }}>{guest.email}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ padding:"3px 10px", borderRadius:5, fontSize:11, fontWeight:600, background:C.tag, color:C.textMid }}>{persona}</span>
          <span style={{ padding:"3px 10px", borderRadius:5, fontSize:11, fontWeight:600, background:"#F0FDF4", color:"#15803D" }}>Success</span>
          <span style={{ fontSize:11, color:C.textMute }}>{expanded ? "▲ Collapse" : "▼ Expand"}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding:"0 20px 20px", borderTop:`1px solid ${C.divider}` }}>

          {/* Metadata */}
          {metadata && (
            <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
              <div>
                <MetaRow label="Location"        value={metadata.location} />
                <MetaRow label="Job Title"       value={metadata.profession} />
                <MetaRow label="Company"         value={metadata.company} />
                <MetaRow label="Seniority"       value={metadata.seniority} />
              </div>
              <div>
                <MetaRow label="Salary Estimate" value={metadata.salary} />
                <MetaRow label="Spending Level"  value={metadata.spendingLevel} />
                <MetaRow label="Travel Frequency" value={metadata.travelFrequency} />
                <MetaRow label="Social Profiles" value={Object.keys(profiles||{}).length || null} />
              </div>
            </div>
          )}

          {/* Room / Offer / Note */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginTop:16 }}>
            {[
              { label:"Room Recommendation", value:analysis.roomRecommendation },
              { label:"Personalized Offer",  value:analysis.personalizedOffer },
              { label:"Staff Note",          value:analysis.staffNote },
            ].map(({label,value}) => (
              <div key={label} style={{ padding:"12px 14px", background:C.bg, borderRadius:8, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.textMute, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>{label}</div>
                <div style={{ fontSize:12, color:C.text, lineHeight:1.55 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Ad Posters + Send */}
          <AdPosters
            persona={persona}
            guestName={guest.name}
            guestEmail={guest.email}
            meta={metadata}
            analysis={analysis}
            hotelRecommendations={hotelRecommendations}
          />

          {/* QR Code */}
          <QRCodeSection guest={guest} />

        </div>
      )}
    </div>
  );
}

export default function BatchProcess() {
  const [dragging,  setDragging]  = useState(false);
  const [file,      setFile]      = useState(null);
  const [jobId,     setJobId]     = useState(null);
  const [job,       setJob]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const pollRef  = useRef(null);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.name.endsWith(".csv")) { setError("Please upload a valid CSV file."); return; }
    setFile(f); setError("");
  };

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }, []);
  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  async function startBatch() {
    if (!file) return;
    setUploading(true); setError(""); setJob(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await axios.post(`${API}/api/batch/upload`, fd);
      setJobId(res.data.jobId);
      setJob({ total: res.data.total, processed: 0, success: 0, failed: 0, status: "running", results: [] });
      pollRef.current = setInterval(async () => {
        const status = await axios.get(`${API}/api/batch/status/${res.data.jobId}`);
        setJob(status.data);
        if (status.data.status === "completed") clearInterval(pollRef.current);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally { setUploading(false); }
  }

  const progress = job ? Math.round((job.processed / job.total) * 100) : 0;

  return (
    <div style={{ fontFamily:"'DM Sans','Helvetica Neue',sans-serif", background:C.bg, minHeight:"100vh", color:C.text }}>

      <div style={{ padding:"28px 40px 20px", borderBottom:`1px solid ${C.border}`, background:C.surface }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:C.text, letterSpacing:"-0.3px", marginBottom:3 }}>Batch Guest Processing</h1>
        <p style={{ color:C.textMid, fontSize:13 }}>Upload a CSV with guest names and emails. Each guest gets a complete intelligence profile, ad creatives and QR code.</p>
      </div>

      <div style={{ padding:"24px 40px" }}>

        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 18px", marginBottom:20, fontSize:12, color:C.textMid, lineHeight:1.6 }}>
          <strong style={{ color:C.text }}>CSV Format:</strong> columns <code style={{ background:C.tag, padding:"1px 6px", borderRadius:4 }}>name</code> and <code style={{ background:C.tag, padding:"1px 6px", borderRadius:4 }}>email</code>. Example row: <code style={{ background:C.tag, padding:"1px 6px", borderRadius:4 }}>Santhosh Kumar, santhosh@gmail.com</code>
        </div>

        {!job && (
          <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => inputRef.current?.click()}
            style={{ border:`2px dashed ${dragging?C.text:file?C.borderDark:C.border}`, borderRadius:12, padding:"44px 36px", textAlign:"center", background: dragging?C.tag:file?C.bg:C.surface, cursor:"pointer", marginBottom:20 }}>
            <input ref={inputRef} type="file" accept=".csv" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])} />
            {file ? (
              <>
                <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>{file.name}</div>
                <div style={{ fontSize:12, color:C.textMute }}>{(file.size/1024).toFixed(1)} KB · Click to change file</div>
              </>
            ) : (
              <>
                <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>Drop your CSV file here</div>
                <div style={{ fontSize:12, color:C.textMute }}>or click to browse</div>
              </>
            )}
          </div>
        )}

        {error && (
          <div style={{ padding:"11px 14px", background:C.bg, border:`1px solid ${C.borderDark}`, borderRadius:8, color:C.text, fontSize:13, marginBottom:18 }}>{error}</div>
        )}

        {file && !job && (
          <button onClick={startBatch} disabled={uploading}
            style={{ padding:"11px 0", borderRadius:8, border:"none", background:uploading?C.borderDark:C.fill, color:"#fff", fontSize:13, fontWeight:700, cursor:uploading?"not-allowed":"pointer", width:"100%", fontFamily:"inherit" }}>
            {uploading ? "Starting batch job..." : "Start Batch Processing"}
          </button>
        )}

        {job && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>

            <div style={{ background:C.surface, borderRadius:10, border:`1px solid ${C.border}`, padding:"20px 24px", marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{job.status==="completed" ? "Batch Complete" : "Processing Guests..."}</div>
                  <div style={{ fontSize:12, color:C.textMute }}>Job ID: {jobId}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:22, fontWeight:700, color:C.text }}>{progress}%</div>
                  <div style={{ fontSize:11, color:C.textMute }}>{job.processed} / {job.total}</div>
                </div>
              </div>
              <div style={{ height:6, background:C.tag, borderRadius:4, overflow:"hidden", marginBottom:16 }}>
                <div style={{ height:"100%", width:`${progress}%`, background:C.text, opacity:0.8, transition:"width 0.5s ease" }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {[{ label:"Total", val:job.total }, { label:"Success", val:job.success }, { label:"Failed", val:job.failed }].map(s => (
                  <div key={s.label} style={{ background:C.bg, borderRadius:8, padding:"12px 14px", textAlign:"center", border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:20, fontWeight:700, color:C.text }}>{s.val}</div>
                    <div style={{ fontSize:10, color:C.textMute, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {job.results.length > 0 && (
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Guest Results — click to expand full profile</div>
                {job.results.map((r, i) => <GuestResultCard key={i} result={r} index={i} />)}
              </div>
            )}

            {job.status === "completed" && (
              <button onClick={() => { setJob(null); setFile(null); setJobId(null); }}
                style={{ marginTop:16, padding:"9px 20px", borderRadius:7, border:`1px solid ${C.border}`, background:C.surface, fontSize:12, fontWeight:600, cursor:"pointer", color:C.text, fontFamily:"inherit" }}>
                ↩ Process Another File
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } } * { box-sizing: border-box; }`}</style>
    </div>
  );
}