import { useState, useEffect, useCallback } from "react";

import { C } from "./constants/theme";
import { DEFAULT_USER } from "./constants/config";
import { loadStats } from "./api/loadStats";
import { exportHTML } from "./utils/exportHTML";

import { TermLog } from "./components/ui/index";
import { Header } from "./components/dashboard/Header";
import { ProfileCard } from "./components/dashboard/ProfileCard";
import { StatsRow } from "./components/dashboard/StatsRow";
import { TopRepos } from "./components/dashboard/TopRepos";
import { RecentRepos } from "./components/dashboard/RecentRepos";

export default function App() {
  const [input, setInput]   = useState(DEFAULT_USER);
  const [data, setData]     = useState(null);
  const [log, setLog]       = useState([]);
  const [loading, setLoading] = useState(false);

  const push = useCallback(
    (text, ok = true) => setLog((l) => [...l, { text, ok }]),
    [],
  );

  const load = useCallback(
    async (user) => {
      setLoading(true);
      setData(null);
      setLog([]);
      try {
        push(`Connecting to github.com/${user}...`);
        const stats = await loadStats(user);
        push(`Found ${stats.repos.length} repositories across ${stats.langs.length} languages`);
        push(`${stats.totalStars} total stars · joined ${new Date(stats.user.created_at).getFullYear()}`);
        if (stats.pinnedCount > 0) push(`${stats.pinnedCount} pinned repositories detected`);
        setData(stats);
      } catch (e) {
        push(e.message, false);
      }
      setLoading(false);
    },
    [push],
  );

  useEffect(() => {
    load(DEFAULT_USER);
  }, []);

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

      <div id="dashboard-root" style={{ padding: "32px 32px 80px" }}>
        <Header
          input={input}
          setInput={setInput}
          loading={loading}
          onLoad={load}
          onExport={() => exportHTML(data)}
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

            <StatsRow
              langs={data.langs}
              originalCount={data.originalCount}
              forkCount={data.forkCount}
              reposByYear={data.reposByYear}
            />

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
              <span>data via api.github.com</span>
              <span>{new Date().toISOString().slice(0, 10)}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
