import { C, LANG_COLOR } from "../../constants/theme";
import { Card } from "../ui/Card";
import { SectionTitle } from "../ui/index";

export function RecentRepos({ recentRepos }) {
  return (
    <Card>
      <SectionTitle>Recently Updated</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {recentRepos.map((r, i) => (
          <div
            key={r.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 0",
              borderBottom:
                i < recentRepos.length - 1 ? `1px solid ${C.border}` : "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: C.dim,
                minWidth: 22,
                flexShrink: 0,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: C.text,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.name}
            </span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: C.dim,
                flexShrink: 0,
              }}
            >
              {new Date(r.updated_at).toISOString().slice(0, 10)}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                flexShrink: 0,
                width: 90,
              }}
            >
              {r.language && (
                <>
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: LANG_COLOR[r.language] || C.dim,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.muted }}>
                    {r.language}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
