import { C } from "../../constants/theme";
import { ExportBtn } from "../ui/index";

export function Header({
  input,
  setInput,
  vsInput,
  setVsInput,
  loading,
  onLoad,
  onExport,
  hasData,
}) {
  const go = () => onLoad(input, vsInput);
  const inputStyle = {
    background: "transparent",
    border: "none",
    color: C.text,
    fontFamily: "var(--mono)",
    fontSize: 13,
    padding: "10px 14px",
    width: 140,
  };
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

      <div
        className="noPrint headerControls"
        style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
      >
        {/* Search bar */}
        <div
          className="searchBar"
          style={{
            display: "flex",
            background: C.surface,
            border: `1px solid ${C.border2}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <span
            className="searchPrefix"
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
            onKeyDown={(e) => e.key === "Enter" && go()}
            style={inputStyle}
            aria-label="GitHub username"
            placeholder="username"
            spellCheck={false}
          />
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: C.dim,
              padding: "10px 8px",
              borderLeft: `1px solid ${C.border}`,
              background: C.card,
            }}
          >
            vs
          </span>
          <input
            value={vsInput}
            onChange={(e) => setVsInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go()}
            style={{ ...inputStyle, width: 120 }}
            aria-label="Compare with username (optional)"
            placeholder="optional"
            spellCheck={false}
          />
          <button
            onClick={go}
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
            <ExportBtn onClick={() => onExport("html")} icon="📄">
              HTML
            </ExportBtn>
            <ExportBtn onClick={() => onExport("png")} icon="🖼️">
              PNG
            </ExportBtn>
            <ExportBtn onClick={() => onExport("pdf")} icon="🖨️">
              PDF
            </ExportBtn>
          </div>
        )}
      </div>
    </div>
  );
}
