import { useState, useEffect } from "react";

interface ChangelogEntry {
  hash: string;
  timestamp: string;
  provider: string;
  model: string;
  result: {
    summary: string;
    impact: "minor" | "major" | "breaking" | "none";
    breaking: boolean;
    files: { path: string; explanation: string }[];
    relatedIssues: string[];
  };
}

interface ConfigData {
  ai: {
    routing: {
      strategy: string;
      localOnly: boolean;
    };
    providers: { name: string; url: string }[];
  };
}

const API_BASE = window.location.origin.includes("5173")
  ? "http://localhost:4200"
  : window.location.origin;

// Clean SVG Icons
const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon-sparkles"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" opacity="0.6" />
    <path
      d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z"
      opacity="0.6"
    />
  </svg>
);

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon-file"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);

const HistoryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon-history"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon-settings"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const GenerateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "16px", height: "16px", marginRight: "8px" }}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

// Library Logo Component matching C:\Users\Eldrex\Downloads\classhost\DevDiff\asset\devdiff.svg
const Logo = () => (
  <svg
    className="logo-svg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 500 500"
  >
    <defs>
      <linearGradient id="logoRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#0033aa", stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: "#0066ff", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#00bfff", stopOpacity: 1 }} />
      </linearGradient>

      <linearGradient id="logoLeftGrad" x1="100%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" style={{ stopColor: "#6d28d9", stopOpacity: 1 }} />
        <stop offset="40%" style={{ stopColor: "#7c3aed", stopOpacity: 0.8 }} />
        <stop offset="80%" style={{ stopColor: "#a78bfa", stopOpacity: 0.1 }} />
        <stop offset="100%" style={{ stopColor: "#ffffff", stopOpacity: 0 }} />
      </linearGradient>

      <linearGradient id="logoIrisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#00e5ff", stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: "#0099ff", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#0033cc", stopOpacity: 1 }} />
      </linearGradient>

      <radialGradient id="logoPupilHighlight" cx="35%" cy="35%" r="70%">
        <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 0.8 }} />
        <stop offset="50%" style={{ stopColor: "#ffffff", stopOpacity: 0.1 }} />
        <stop offset="100%" style={{ stopColor: "#ffffff", stopOpacity: 0 }} />
      </radialGradient>
    </defs>

    <rect
      x="100"
      y="150"
      width="200"
      height="200"
      rx="55"
      transform="rotate(45 200 250)"
      fill="url(#logoLeftGrad)"
    />
    <rect
      x="200"
      y="150"
      width="200"
      height="200"
      rx="55"
      transform="rotate(45 300 250)"
      fill="url(#logoRightGrad)"
    />
    <path
      d="M 160 250 Q 250 160 340 250 Q 250 340 160 250 Z"
      fill="none"
      stroke="#ffffff"
      strokeWidth="12"
      strokeLinejoin="round"
    />
    <circle cx="250" cy="250" r="46" fill="url(#logoIrisGrad)" />
    <circle cx="250" cy="250" r="46" fill="url(#logoPupilHighlight)" />
    <circle cx="250" cy="250" r="24" fill="#001a66" opacity="0.9" />
    <circle cx="236" cy="236" r="8" fill="#ffffff" opacity="0.95" />
  </svg>
);

function App() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChangelogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/changelogs`);
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
        if (data.data.length > 0 && !selectedHash) {
          setSelectedHash(data.data[0].hash);
        }
      }
    } catch {
      setError("Could not connect to DevDiff API server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/config`);
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch {}
  };

  const triggerGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        await fetchChangelogs();
      } else {
        alert(data.message || "No staged changes detected.");
      }
    } catch {
      alert("Failed to connect to generator API.");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchChangelogs();
    fetchConfig();
  }, []);

  const selectedEntry = entries.find((c) => c.hash === selectedHash);

  return (
    <div className="app-container">
      <header>
        <div className="logo-container">
          <Logo />
          <div className="logo-text">
            Dev<span>Diff</span>
          </div>
        </div>
        <div
          className="status-badge"
          style={{
            background: error ? "rgba(239, 68, 68, 0.08)" : undefined,
            borderColor: error ? "rgba(239, 68, 68, 0.2)" : undefined,
            color: error ? "#ef4444" : undefined,
          }}
        >
          <span
            className="status-dot"
            style={{
              background: error ? "#ef4444" : undefined,
              boxShadow: error ? "0 0 10px #ef4444" : undefined,
            }}
          ></span>
          {error ? "API Disconnected" : "Workspace Connected"}
        </div>
      </header>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--text-muted)",
          }}
        >
          Loading changelogs...
        </div>
      ) : (
        <main className="grid">
          <section className="sidebar">
            <div
              className="card"
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <button
                onClick={triggerGenerate}
                disabled={generating}
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--accent))",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  padding: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: generating ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <GenerateIcon />
                {generating ? "Explaining..." : "Generate Staged Changelog"}
              </button>
            </div>

            <div className="card">
              <h2>
                <HistoryIcon />
                Audit History
              </h2>
              {entries.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  No changelogs recorded yet. Run git commits or use the trigger
                  button above.
                </div>
              ) : (
                <div className="list">
                  {entries.map((item) => (
                    <div
                      key={item.hash}
                      className={`list-item ${selectedHash === item.hash ? "active" : ""}`}
                      onClick={() => setSelectedHash(item.hash)}
                    >
                      <div style={{ flex: 1, marginRight: "10px" }}>
                        <div className="list-item-title">
                          {item.result.summary.substring(0, 40)}...
                        </div>
                        <div className="list-item-date">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div>
                        <span
                          className={`badge ${item.result.breaking ? "badge-breaking" : "badge-minor"}`}
                        >
                          {item.result.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {config && (
              <div className="card" style={{ padding: "1.5rem" }}>
                <h2>
                  <SettingsIcon />
                  Config Status
                </h2>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <strong>Routing strategy:</strong>{" "}
                    {config.ai.routing.strategy}
                  </div>
                  <div>
                    <strong>Local Only:</strong>{" "}
                    {config.ai.routing.localOnly ? "yes" : "no"}
                  </div>
                  {config.ai.providers.length > 0 && (
                    <div>
                      <strong>Active Provider:</strong>{" "}
                      {config.ai.providers[0].name}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="main-content">
            {selectedEntry ? (
              <div className="card">
                <h2>
                  <SparklesIcon />
                  Changelog Analysis
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                    alignItems: "center",
                  }}
                >
                  <span
                    className={`badge ${selectedEntry.result.breaking ? "badge-breaking" : "badge-minor"}`}
                  >
                    {selectedEntry.result.impact} Impact
                  </span>
                  <span
                    style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}
                  >
                    Generated:{" "}
                    {new Date(selectedEntry.timestamp).toLocaleString()}
                  </span>
                  <span
                    style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}
                  >
                    Provider: {selectedEntry.provider} ({selectedEntry.model})
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "1.1rem",
                    lineHeight: "1.7",
                    marginBottom: "2.5rem",
                    color: "#f1f5f9",
                  }}
                >
                  {selectedEntry.result.summary}
                </p>

                {selectedEntry.result.files &&
                  selectedEntry.result.files.length > 0 && (
                    <>
                      <h3
                        style={{
                          fontFamily: "Outfit",
                          fontSize: "1.25rem",
                          marginBottom: "1rem",
                          borderBottom: "1px solid var(--border)",
                          paddingBottom: "0.5rem",
                        }}
                      >
                        File Breakdown
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {selectedEntry.result.files.map((file, idx) => (
                          <div key={idx} className="file-row">
                            <div className="file-header">
                              <FileIcon />
                              <div className="file-name">{file.path}</div>
                            </div>
                            <div className="file-desc">{file.explanation}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
              </div>
            ) : (
              <div
                className="card"
                style={{
                  textAlign: "center",
                  padding: "5rem",
                  color: "var(--text-muted)",
                }}
              >
                Select a changelog from the audit log to view detailed analysis.
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
