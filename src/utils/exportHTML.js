import { C, LANG_COLOR } from "../constants/theme";

export function exportHTML(data) {
  const lc = (col) => LANG_COLOR[col] || C.dim;
  const maxLang = Math.max(...data.langs.map((l) => l.count));
  const maxYear = Math.max(...data.reposByYear.map((d) => d.count));

  const langRows = data.langs
    .map(
      ({ lang, count }) => `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:8px;height:8px;border-radius:50%;background:${lc(lang)}"></div>
          <span style="font-family:monospace;font-size:12px;color:${C.text}">${lang}</span>
        </div>
        <span style="font-family:monospace;font-size:11px;color:${C.dim}">${count}</span>
      </div>
      <div style="height:4px;background:${C.border};border-radius:2px">
        <div style="height:100%;width:${(count / maxLang) * 100}%;background:${lc(lang)};border-radius:2px"></div>
      </div>
    </div>`,
    )
    .join("");

  const yearBars = data.reposByYear
    .map(
      (d) => `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end">
      <span style="font-family:monospace;font-size:10px;color:${C.muted}">${d.count}</span>
      <div style="width:100%;border-radius:4px 4px 0 0;background:linear-gradient(180deg,${C.accent},${C.accent2});height:${(d.count / maxYear) * 100}%;min-height:4px"></div>
    </div>`,
    )
    .join("");

  const yearLabels = data.reposByYear
    .map(
      (d) => `
    <div style="flex:1;text-align:center;font-family:monospace;font-size:10px;color:${C.dim}">${d.year}</div>`,
    )
    .join("");

  const repoCards = data.topRepos
    .map(
      (r) => `
    <a href="${r.url}" target="_blank" style="text-decoration:none;display:block;background:${C.surface};border:1px solid ${C.border};border-radius:8px;padding:14px 16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px">
        <span style="font-family:monospace;font-size:12px;color:${C.accent};font-weight:500">
          ${r.pinned ? "📌 " : ""}${r.name}
        </span>
        <div style="display:flex;gap:10px;flex-shrink:0">
          ${r.stars > 0 ? `<span style="font-family:monospace;font-size:10px;color:${C.dim}">★ ${r.stars}</span>` : ""}
          ${r.forks > 0 ? `<span style="font-family:monospace;font-size:10px;color:${C.dim}">⑂ ${r.forks}</span>` : ""}
        </div>
      </div>
      ${r.desc ? `<div style="font-size:11px;color:${C.muted};line-height:1.5;margin-bottom:8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${r.desc}</div>` : ""}
      ${r.lang ? `<div style="display:flex;align-items:center;gap:6px;margin-top:4px"><div style="width:8px;height:8px;border-radius:50%;background:${lc(r.lang)}"></div><span style="font-family:monospace;font-size:10px;color:${C.dim}">${r.lang}</span></div>` : ""}
    </a>`,
    )
    .join("");

  const recentRows = data.recentRepos
    .map(
      (r, i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:${i < data.recentRepos.length - 1 ? `1px solid ${C.border}` : "none"}">
      <span style="font-family:monospace;font-size:10px;color:${C.dim};min-width:22px;flex-shrink:0">${String(i + 1).padStart(2, "0")}</span>
      <span style="font-family:monospace;font-size:12px;color:${C.text};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.name}</span>
      <span style="font-family:monospace;font-size:10px;color:${C.dim};flex-shrink:0">${new Date(r.updated_at).toISOString().slice(0, 10)}</span>
      <div style="display:flex;align-items:center;gap:5px;flex-shrink:0;width:90px">
        ${r.language ? `<div style="width:7px;height:7px;border-radius:50%;background:${lc(r.language)}"></div><span style="font-family:monospace;font-size:10px;color:${C.muted}">${r.language}</span>` : ""}
      </div>
    </div>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>GitHub Dashboard — ${data.user.login}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:${C.bg};color:${C.text};font-family:system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:6px;background:${C.bg}}
  ::-webkit-scrollbar-thumb{background:${C.border2};border-radius:3px}
  a{color:inherit;text-decoration:none}
  @media(max-width:640px){.grid2{grid-template-columns:1fr!important}.grid4{grid-template-columns:1fr!important}}
</style>
</head>
<body>
<div style="padding:32px 32px 80px;max-width:1400px;margin:0 auto">

  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:16px;border-bottom:1px solid ${C.border};padding-bottom:20px">
    <div>
      <div style="font-family:monospace;font-size:10px;letter-spacing:.25em;color:${C.dim};margin-bottom:6px">GITHUB PROFILE DASHBOARD</div>
      <h1 style="font-size:clamp(20px,3vw,28px);font-weight:700;color:${C.text};letter-spacing:-.02em">Developer Analytics</h1>
    </div>
    <div style="font-family:monospace;font-size:10px;color:${C.dim}">${new Date().toISOString().slice(0, 10)} · github.com/${data.user.login}</div>
  </div>

  <div class="grid4" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:20px">
    <div style="background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:20px 24px;display:flex;align-items:center;gap:14px">
      <img src="${data.user.avatar_url}" crossorigin="anonymous" style="width:48px;height:48px;border-radius:50%;border:2px solid ${C.border2};flex-shrink:0">
      <div>
        <div style="font-size:15px;font-weight:700;color:${C.text}">${data.user.name || data.user.login}</div>
        <div style="font-family:monospace;font-size:10px;color:${C.dim};margin-top:3px">@${data.user.login}</div>
        ${data.user.location ? `<div style="font-family:monospace;font-size:10px;color:${C.dim};margin-top:2px">📍 ${data.user.location}</div>` : ""}
      </div>
    </div>
    ${[
      ["REPOSITORIES", data.user.public_repos, C.text],
      ["TOTAL STARS",  data.totalStars,         C.orange],
      ["FOLLOWERS",    data.user.followers,      C.accent],
    ]
      .map(
        ([l, v, c]) => `
    <div style="background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:20px 24px">
      <div style="font-family:monospace;font-size:10px;letter-spacing:.15em;color:${C.dim};margin-bottom:4px">${l}</div>
      <div style="font-size:clamp(24px,3vw,36px);font-weight:700;color:${c};line-height:1">${v}</div>
    </div>`,
      )
      .join("")}
  </div>

  ${data.user.bio ? `<div style="font-size:13px;color:${C.muted};margin-bottom:24px">${data.user.bio}</div>` : ""}

  <div class="grid2" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-bottom:16px">
    <div style="background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:20px 24px">
      <div style="font-family:monospace;font-size:10px;letter-spacing:.2em;color:${C.dim};margin-bottom:16px;text-transform:uppercase">Languages</div>
      ${langRows}
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:20px 24px;display:flex;gap:0">
        <div style="flex:1;padding-right:20px">
          <div style="font-family:monospace;font-size:10px;letter-spacing:.15em;color:${C.dim};margin-bottom:4px">ORIGINAL</div>
          <div style="font-size:clamp(24px,3vw,36px);font-weight:700;color:${C.green};line-height:1">${data.originalCount}</div>
        </div>
        <div style="flex:1;padding-left:20px">
          <div style="font-family:monospace;font-size:10px;letter-spacing:.15em;color:${C.dim};margin-bottom:4px">FORKED</div>
          <div style="font-size:clamp(24px,3vw,36px);font-weight:700;color:${C.dim};line-height:1">${data.forkCount}</div>
        </div>
      </div>
      <div style="background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:20px 24px;flex:1">
        <div style="font-family:monospace;font-size:10px;letter-spacing:.2em;color:${C.dim};margin-bottom:16px;text-transform:uppercase">Repos by year</div>
        <div style="display:flex;align-items:flex-end;gap:8px;height:140px">${yearBars}</div>
        <div style="height:1px;background:${C.border};margin:0 0 8px"></div>
        <div style="display:flex;gap:8px">${yearLabels}</div>
      </div>
    </div>
  </div>

  <div style="background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:20px 24px;margin-bottom:16px">
    <div style="font-family:monospace;font-size:10px;letter-spacing:.2em;color:${C.dim};margin-bottom:16px;text-transform:uppercase">
      Top Repositories ${data.pinnedCount > 0 ? `<span style="color:${C.accent};margin-left:8px">📌 ${data.pinnedCount} pinned</span>` : ""}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">${repoCards}</div>
  </div>

  <div style="background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:20px 24px">
    <div style="font-family:monospace;font-size:10px;letter-spacing:.2em;color:${C.dim};margin-bottom:16px;text-transform:uppercase">Recently Updated</div>
    ${recentRows}
  </div>

  <div style="margin-top:24px;font-family:monospace;font-size:10px;color:${C.dim};display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
    <span>data via api.github.com · generated ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC</span>
    <span>github.com/${data.user.login}</span>
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const link = document.createElement("a");
  link.download = `github-dashboard-${data.user.login}.html`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}
