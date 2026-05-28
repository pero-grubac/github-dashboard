import { C, LANG_COLOR } from "../../constants/theme";
import { Card } from "../ui/Card";
import { SectionTitle } from "../ui/index";

function RepoCard({ r }) {
  return (
    <div
      onClick={() => window.open(r.url, "_blank")}
      style={{
        background: C.surface,
        border: `1px solid ${r.pinned ? C.accent + "44" : C.border}`,
        borderRadius: 8,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "border-color 0.15s, transform 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = r.pinned ? C.accent + "88" : C.border2;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = r.pinned ? C.accent + "44" : C.border;
        e.currentTarget.style.transform = "none";
      }}
    >
      {r.pinned && (
        <div style={{ position: "absolute", top: 10, right: 10, fontSize: 10, opacity: 0.5 }}>
          📌
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
          marginBottom: 6,
          paddingRight: r.pinned ? 18 : 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: C.accent,
            fontWeight: 500,
            wordBreak: "break-all",
          }}
        >
          {r.name}
        </span>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          {r.stars > 0 && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.dim }}>
              ★ {r.stars}
            </span>
          )}
          {r.forks > 0 && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.dim }}>
              ⑂ {r.forks}
            </span>
          )}
        </div>
      </div>
      {r.desc && (
        <div
          style={{
            fontSize: 11,
            color: C.muted,
            lineHeight: 1.5,
            marginBottom: 8,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {r.desc}
        </div>
      )}
      {r.lang && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: LANG_COLOR[r.lang] || C.dim,
            }}
          />
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.dim }}>
            {r.lang}
          </span>
        </div>
      )}
    </div>
  );
}

export function TopRepos({ topRepos, pinnedCount }) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <SectionTitle style={{ marginBottom: 0 }}>Top Repositories</SectionTitle>
        {pinnedCount > 0 && (
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              color: C.accent,
              letterSpacing: "0.15em",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            📌 {pinnedCount} PINNED
          </span>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 10,
        }}
      >
        {topRepos.map((r) => (
          <RepoCard key={r.name} r={r} />
        ))}
      </div>
    </Card>
  );
}
