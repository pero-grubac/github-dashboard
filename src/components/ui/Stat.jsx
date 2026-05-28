import { C } from "../../constants/theme";

export function Stat({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.15em",
          color: C.dim,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--sans)",
          fontSize: "clamp(24px,3vw,36px)",
          fontWeight: 700,
          color: color || C.text,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
