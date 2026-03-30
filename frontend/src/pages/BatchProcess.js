import React, { useState, useCallback, useRef } from "react";
import axios from "axios";

const API = "https://hospitality-app-39zz.onrender.com";

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ padding: "36px 40px 24px", borderBottom: "1px solid #D0D7DE", background: "#fff" }}>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#0D1117", marginBottom: 4 }}>{title}</h1>
      <p style={{ color: "#57606A", fontSize: 14 }}>{subtitle}</p>
    </div>
  );
}

export default function BatchProcess() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef(null);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file.");
      return;
    }
    setFile(f); setError("");
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
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
    } finally {
      setUploading(false);
    }
  }

  const progress = job ? Math.round((job.processed / job.total) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Batch Guest Processing"
        subtitle="Upload a CSV file with guest names and emails. The system will analyse all guests automatically and save results to the database."
      />
      <div style={{ padding: "32px 40px" }}>
        <div style={{
          background: "#EFF6FF", border: "1px solid #BFDBFE",
          borderRadius: 12, padding: "16px 20px", marginBottom: 24,
          display: "flex", gap: 16, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1E40AF", marginBottom: 4 }}>CSV Format Required</div>
            <div style={{ fontSize: 12, color: "#1E3A8A", lineHeight: 1.6 }}>
              Your CSV must have columns: <code style={{ background: "#DBEAFE", padding: "1px 6px", borderRadius: 4 }}>name</code> and <code style={{ background: "#DBEAFE", padding: "1px 6px", borderRadius: 4 }}>email</code><br />
              Example row: <code style={{ background: "#DBEAFE", padding: "1px 6px", borderRadius: 4 }}>Santhosh Kumar, santhosh@gmail.com</code>
            </div>
          </div>
        </div>

        {!job && (
          <div
            onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? "#B8860B" : file ? "#16A34A" : "#D0D7DE"}`,
              borderRadius: 16, padding: "48px 40px", textAlign: "center",
              background: dragging ? "#FEF3C7" : file ? "#F0FDF4" : "#fff",
              cursor: "pointer", transition: "all 0.2s", marginBottom: 24,
            }}
          >
            <input ref={inputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ fontSize: 40, marginBottom: 12 }}>{file ? "✅" : "📂"}</div>
            {file ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#065F46", marginBottom: 4 }}>{file.name}</div>
                <div style={{ fontSize: 13, color: "#16A34A" }}>{(file.size / 1024).toFixed(1)} KB · Click to change file</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#0D1117", marginBottom: 4 }}>Drop your CSV file here</div>
                <div style={{ fontSize: 13, color: "#57606A" }}>or click to browse · Accepts .csv files only</div>
              </>
            )}
          </div>
        )}

        {error && (
          <div style={{ padding: 14, background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 10, color: "#991B1B", fontSize: 13, marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        {file && !job && (
          <button
            onClick={startBatch} disabled={uploading}
            style={{
              padding: "12px 32px", borderRadius: 10, border: "none",
              background: uploading ? "#D0D7DE" : "linear-gradient(135deg, #B8860B, #D4A017)",
              color: uploading ? "#8B949E" : "#fff", fontSize: 15, fontWeight: 600,
              cursor: uploading ? "not-allowed" : "pointer", display: "block", width: "100%",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {uploading ? "Starting batch job..." : "🚀 Start Batch Processing"}
          </button>
        )}

        {job && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #D0D7DE", padding: "28px 32px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#0D1117", marginBottom: 2 }}>
                    {job.status === "completed" ? "✅ Batch Complete!" : "⏳ Processing Guests..."}
                  </div>
                  <div style={{ fontSize: 13, color: "#57606A" }}>Job ID: {jobId}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#0D1117" }}>{progress}%</div>
                  <div style={{ fontSize: 12, color: "#8B949E" }}>{job.processed} / {job.total}</div>
                </div>
              </div>

              <div style={{ height: 10, background: "#E8ECF0", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
                <div style={{
                  height: "100%", width: `${progress}%`, borderRadius: 10,
                  background: job.status === "completed" ? "linear-gradient(90deg, #16A34A, #22C55E)" : "linear-gradient(90deg, #B8860B, #D4A017)",
                  transition: "width 0.5s ease",
                }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { label: "Total", val: job.total, color: "#0D1117", bg: "#F6F8FA" },
                  { label: "Success", val: job.success, color: "#065F46", bg: "#F0FDF4" },
                  { label: "Failed", val: job.failed, color: "#991B1B", bg: "#FEF2F2" },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: "#8B949E", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {job.results.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #D0D7DE", overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid #D0D7DE", fontWeight: 700, fontSize: 13, color: "#0D1117", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Results
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#F6F8FA" }}>
                        {["#", "Name", "Email", "Persona", "Status"].map(h => (
                          <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#57606A", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {job.results.map((r, i) => (
                        <tr key={i} style={{ borderTop: "1px solid #E8ECF0" }}>
                          <td style={{ padding: "10px 16px", color: "#8B949E" }}>{i + 1}</td>
                          <td style={{ padding: "10px 16px", fontWeight: 500 }}>{r.name}</td>
                          <td style={{ padding: "10px 16px", color: "#57606A" }}>{r.email}</td>
                          <td style={{ padding: "10px 16px", color: "#57606A" }}>{r.persona || "—"}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{
                              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                              background: r.status === "success" ? "#D1FAE5" : "#FEE2E2",
                              color: r.status === "success" ? "#065F46" : "#991B1B",
                            }}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {job.status === "completed" && (
              <button
                onClick={() => { setJob(null); setFile(null); setJobId(null); }}
                style={{
                  marginTop: 20, padding: "10px 24px", borderRadius: 8, border: "1.5px solid #D0D7DE",
                  background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  color: "#0D1117", fontFamily: "'DM Sans', sans-serif",
                }}
              >
                ↩ Process Another File
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}