import { C } from "../../constants/theme";

export function Card({ children, style }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "20px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
