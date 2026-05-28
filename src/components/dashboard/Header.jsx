import { C } from "../../constants/theme";
import { ExportBtn } from "../ui/index";

export function Header({ input, setInput, loading, onLoad, onExport, hasData }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 32,
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.25em",
            color: C.dim,
            marginBottom: 6,
          }}
        >
          GITHUB PROFILE DASHBOARD
        </div>
        <h1
          style={{
            fontFamily: "var(--sans)",
            fontSize: "clamp(20px,3vw,28px)",
            fontWeight: 700,
            color: C.text,
            letterSpacing: "-0.02em",
          }}
        >
          Developer Analytics
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {/* Search bar */}
        <div
          style={{
            display: "flex",
            background: C.surface,
            border: `1px solid ${C.border2}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              color: C.dim,
              padding: "10px 12px",
              borderRight: `1px solid ${C.border}`,
              background: C.card,
              whiteSpace: "nowrap",
            }}
          >
            github.com /
          </span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onLoad(input)}
            style={{
              background: "transparent",
              border: "none",
              color: C.text,
              fontFamily: "var(--mono)",
              fontSize: 13,
              padding: "10px 14px",
              width: 140,
            }}
            placeholder="username"
            spellCheck={false}
          />
          <button
            onClick={() => onLoad(input)}
            disabled={loading}
            style={{
              background: C.accent,
              border: "none",
              color: "#fff",
              fontFamily: "var(--mono)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              padding: "10px 18px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {loading ? "..." : "GO"}
          </button>
        </div>

        {/* Export */}
        {hasData && (
          <div style={{ display: "flex", gap: 6 }}>
            <ExportBtn onClick={onExport} icon="📄">
              HTML
            </ExportBtn>
          </div>
        )}
      </div>
    </div>
  );
}
