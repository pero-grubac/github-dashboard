import { useState, useEffect, useRef } from "react";
import { C } from "../../constants/theme";

export function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontFamily: "var(--mono)",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.2em",
        color: C.dim,
        marginBottom: 16,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

export function ExportBtn({ onClick, children, icon }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: hov ? C.border2 : C.surface,
        border: `1px solid ${hov ? C.border2 : C.border}`,
        borderRadius: 6,
        padding: "7px 14px",
        cursor: "pointer",
        fontFamily: "var(--mono)",
        fontSize: 11,
        color: C.muted,
        letterSpacing: "0.1em",
        transition: "all 0.15s",
      }}
    >
      <span>{icon}</span> {children}
    </button>
  );
}

export function TermLog({ lines }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);
  if (!lines.length) return null;
  return (
    <div
      ref={ref}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "12px 16px",
        fontFamily: "var(--mono)",
        fontSize: 11,
        lineHeight: 1.9,
        color: C.muted,
        marginBottom: 24,
      }}
    >
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.ok ? C.muted : C.red }}>
          <span style={{ color: l.ok ? C.accent : C.red, marginRight: 10, opacity: 0.7 }}>
            {l.ok ? "→" : "!"}
          </span>
          {l.text}
        </div>
      ))}
      <span
        style={{
          display: "inline-block",
          width: 7,
          height: 12,
          background: C.accent,
          animation: "blink 1s step-end infinite",
          verticalAlign: "middle",
          opacity: 0.8,
        }}
      />
    </div>
  );
}
