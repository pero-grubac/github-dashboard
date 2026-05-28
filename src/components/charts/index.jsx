import { C, LANG_COLOR } from "../../constants/theme";

export function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140 }}>
        {data.map((d, i) => (
          <div
            key={d.year}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.muted }}>
              {d.count}
            </span>
            <div
              style={{
                width: "100%",
                borderRadius: "4px 4px 0 0",
                background: `linear-gradient(180deg, ${C.accent}, ${C.accent2})`,
                height: `${(d.count / max) * 100}%`,
                minHeight: 4,
                animation: `growUp 0.6s cubic-bezier(.16,1,.3,1) ${i * 60}ms both`,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: C.border, margin: "0 0 8px" }} />
      <div style={{ display: "flex", gap: 8 }}>
        {data.map((d) => (
          <div
            key={d.year}
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: "var(--mono)",
              fontSize: 10,
              color: C.dim,
            }}
          >
            {d.year}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LangBars({ data }) {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map(({ lang, count }, i) => (
        <div key={lang}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: LANG_COLOR[lang] || C.dim,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: C.text }}>
                {lang}
              </span>
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: C.dim }}>
              {count}
            </span>
          </div>
          <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                borderRadius: 2,
                background: LANG_COLOR[lang] || C.accent,
                width: 0,
                animation: `grow ${0.5 + i * 0.07}s cubic-bezier(.16,1,.3,1) forwards`,
                ["--w"]: `${(count / max) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
