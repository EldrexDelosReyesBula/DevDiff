import { AIExplanationResult } from "../ai/providers/base";

export function formatHTML(result: AIExplanationResult): string {
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fileRows = (result.files || [])
    .map(
      (f) => `
      <div class="file-card">
        <div class="file-path">📁 ${f.path}</div>
        <div class="file-explanation">${f.explanation}</div>
      </div>
    `,
    )
    .join("");

  const issuesList = (result.relatedIssues || [])
    .map(
      (issue) =>
        `<span class="badge issue-badge">#${issue.replace("#", "")}</span>`,
    )
    .join("");

  const impactClass = `impact-${result.impact.toLowerCase()}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevDiff Report - ${dateStr}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0a0a0f;
      --panel: rgba(20, 20, 30, 0.6);
      --border: rgba(255, 255, 255, 0.08);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #6366f1;
      --primary-glow: rgba(99, 102, 241, 0.15);
      
      --impact-none: #10b981;
      --impact-minor: #3b82f6;
      --impact-major: #f59e0b;
      --impact-breaking: #ef4444;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      padding: 2rem 1rem;
      display: flex;
      justify-content: center;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(239, 68, 68, 0.03) 0%, transparent 40%);
    }

    .container {
      width: 100%;
      max-width: 800px;
    }

    header {
      margin-bottom: 2.5rem;
      text-align: center;
    }

    .logo-container {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.05em;
      margin-bottom: 0.5rem;
    }

    .logo-diff {
      color: var(--primary);
      text-shadow: 0 0 20px var(--primary-glow);
    }

    .date {
      color: var(--text-muted);
      font-size: 0.95rem;
      font-weight: 300;
    }

    .card {
      background: var(--panel);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), #ec4899);
    }

    h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .summary-text {
      font-size: 1.1rem;
      line-height: 1.7;
      color: #e5e7eb;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .meta-item {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
    }

    .meta-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }

    .meta-value {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 99px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .impact-none { color: var(--impact-none); background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
    .impact-minor { color: var(--impact-minor); background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); }
    .impact-major { color: var(--impact-major); background: rgba(245, 158, 251, 0.1); border: 1px solid rgba(245, 158, 251, 0.2); }
    .impact-breaking { color: var(--impact-breaking); background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }

    .breaking-banner {
      background: rgba(239, 68, 68, 0.08);
      border: 1px dashed var(--impact-breaking);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .breaking-icon {
      font-size: 1.25rem;
    }

    .breaking-title {
      font-weight: 700;
      color: var(--impact-breaking);
      margin-bottom: 0.25rem;
    }

    .breaking-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .file-card {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      transition: transform 0.2s, border-color 0.2s;
    }

    .file-card:hover {
      transform: translateY(-2px);
      border-color: rgba(99, 102, 241, 0.3);
    }

    .file-path {
      font-family: monospace;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 0.5rem;
      word-break: break-all;
    }

    .file-explanation {
      font-size: 0.95rem;
      line-height: 1.6;
      color: #d1d5db;
    }

    .issue-badge {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
      border: 1px solid rgba(99, 102, 241, 0.2);
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
      text-transform: none;
    }

    footer {
      text-align: center;
      margin-top: 3rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    footer a {
      color: var(--primary);
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo-container">
        <span>Dev</span><span class="logo-diff">Diff</span>
      </div>
      <div class="date">${dateStr}</div>
    </header>

    <main>
      ${
        result.breaking
          ? `
      <div class="breaking-banner">
        <span class="breaking-icon">⚠️</span>
        <div>
          <div class="breaking-title">Breaking Changes Detected</div>
          <div class="breaking-desc">This set of changes modifies public APIs or behaviors. Refer to the specific file details below.</div>
        </div>
      </div>
      `
          : ""
      }

      <section class="card">
        <h2>✨ AI Summary</h2>
        <p class="summary-text">${result.summary}</p>
      </section>

      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">Impact Level</div>
          <div class="meta-value">
            <span class="badge ${impactClass}">${result.impact}</span>
          </div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Related Issues</div>
          <div class="meta-value">
            ${issuesList || '<span style="color: var(--text-muted); font-size: 0.9rem;">None</span>'}
          </div>
        </div>
      </div>

      ${
        result.files && result.files.length > 0
          ? `
      <section class="card" style="padding-top: 2rem;">
        <h2 style="margin-bottom: 1.5rem;">📂 File Explanations</h2>
        <div class="file-list">
          ${fileRows}
        </div>
      </section>
      `
          : ""
      }
    </main>

    <footer>
      Generated by <a href="https://github.com/EldrexDelosReyesBula/devdiff" target="_blank">DevDiff</a>. Privacy-First BYOAI Changelogs.
    </footer>
  </div>
</body>
</html>
`;
}
