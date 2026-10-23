import { useState, useEffect, useCallback } from "react";

import { C } from "./constants/theme";
import { DEFAULT_USER } from "./constants/config";
import { loadStats, loadProfile } from "./api/loadStats";
import { exportHTML } from "./utils/exportHTML";
import { exportPNG, exportPDF } from "./utils/exportImage";
import { summarizeProfile } from "./utils/compare";
import { sourceLabel } from "./utils/source";

import { TermLog } from "./components/ui/index";
import { Header } from "./components/dashboard/Header";
import { ProfileCard } from "./components/dashboard/ProfileCard";
import { StatsRow } from "./components/dashboard/StatsRow";
import { TopRepos } from "./components/dashboard/TopRepos";
import { RecentRepos } from "./components/dashboard/RecentRepos";
import { Heatmap } from "./components/dashboard/Heatmap";
import { Comparison } from "./components/dashboard/Comparison";

export default function App() {
  const [input, setInput] = useState(DEFAULT_USER);
  const [vsInput, setVsInput] = useState("");
  const [data, setData] = useState(null);
  const [vs, setVs] = useState(null);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const push = useCallback(
    (text, ok = true) => setLog((l) => [...l, { text, ok }]),
    [],
  );

  const load = useCallback(
    async (rawUser, rawVs = "") => {
      const user = rawUser.trim();
      const vsUser = rawVs.trim();
      if (!user) return;
      setLoading(true);
      setData(null);
      setVs(null);
      setLog([]);
      let stats = null;
      try {
        stats = await loadStats(user, push);
        push(`Data source: ${sourceLabel(stats.source)}`);
        push(
          `Found ${stats.repos.length} repositories across ${stats.langs.length} languages`,
        );
        push(
          `${stats.totalStars} total stars · joined ${new Date(stats.user.created_at).getFullYear()}`,
        );
        if (stats.pinnedCount > 0)
          push(`${stats.pinnedCount} pinned repositories detected`);
        if (stats.contributions)
          push(`${stats.contributions.total} contributions in the last year`);
        setData(stats);
      } catch (e) {
        push(e.message, false);
      }
      if (stats && vsUser && vsUser.toLowerCase() !== user.toLowerCase()) {
        try {
          push(`Comparing with github.com/${vsUser} (live api.github.com)...`);
          const other = await loadProfile(vsUser);
          setVs(summarizeProfile(other.user, other.repos));
          push(`Comparison ready: @${stats.user.login} vs @${other.user.login} ✓`);
        } catch (e) {
          push(`Comparison failed: ${e.message}`, false);
        }
      }
      setLoading(false);
    },
    [push],
  );

  const onExport = async (kind) => {
    if (kind === "html") exportHTML(data);
    else if (kind === "pdf") exportPDF();
    else {
      try {
        await exportPNG(document.getElementById("dashboard-root"), data.user.login);
      } catch (e) {
        push(`PNG export failed: ${e.message}`, false);
      }
    }
  };

  // Load the default profile once on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(DEFAULT_USER);
  }, [load]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --mono: 'JetBrains Mono', monospace; --sans: 'Inter', sans-serif; }
        html, body { background: ${C.bg}; color: ${C.text}; font-family: var(--sans); -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 6px; background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 3px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::selection { background: ${C.accent}33; color: ${C.text}; }
        input { outline: none; }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes grow    { to { width: var(--w); } }
        @keyframes growUp  { from{height:0;opacity:0} to{opacity:1} }
      `}</style>

      <div
        id="dashboard-root"
        style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 32px 80px" }}
      >
        <Header
          input={input}
          setInput={setInput}
          vsInput={vsInput}
          setVsInput={setVsInput}
          loading={loading}
          onLoad={load}
          onExport={onExport}
          hasData={!!data}
        />

        <TermLog lines={log} />

        {data && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <ProfileCard user={data.user} totalStars={data.totalStars} />

            {data.user.bio && (
              <div
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: 13,
                  color: C.muted,
                  marginBottom: 24,
                }}
              >
                {data.user.bio}
              </div>
            )}

            {vs && (
              <Comparison
                a={summarizeProfile(data.user, data.repos)}
                b={vs}
              />
            )}

            <StatsRow
              langs={data.langs}
              frameworks={data.frameworks}
              tools={data.tools}
              originalCount={data.originalCount}
              forkCount={data.forkCount}
              reposByYear={data.reposByYear}
            />

            {data.contributions?.days?.length > 0 && (
              <Heatmap contributions={data.contributions} />
            )}

            <TopRepos topRepos={data.topRepos} pinnedCount={data.pinnedCount} />

            <RecentRepos recentRepos={data.recentRepos} />

            <div
              style={{
                marginTop: 24,
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: C.dim,
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span data-testid="data-source">data via {sourceLabel(data.source)}</span>
              <span>{new Date().toISOString().slice(0, 10)}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
