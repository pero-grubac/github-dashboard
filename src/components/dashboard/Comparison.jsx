import { C, LANG_COLOR } from "../../constants/theme";
import { Card } from "../ui/Card";
import { SectionTitle } from "../ui/index";
import { compareProfiles } from "../../utils/compare";

function LangChip({ lang, shared }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px",
        borderRadius: 999,
        border: `1px solid ${shared ? C.green + "66" : C.border}`,
        background: shared ? C.green + "14" : C.surface,
        fontFamily: "var(--mono)",
        fontSize: 10,
        color: shared ? C.text : C.muted,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: LANG_COLOR[lang] || C.dim,
        }}
      />
      {lang}
    </span>
  );
}

function Side({ p, rows, side, shared }) {
  return (
    <div
      data-testid={`compare-${side}`}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "16px 18px",
        minWidth: 0,
      }}
    >
      <a
        href={p.url}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
          textDecoration: "none",
        }}
      >
        <img
          src={p.avatar}
          alt=""
          width={36}
          height={36}
          style={{ borderRadius: "50%", border: `2px solid ${C.border2}` }}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.text,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p.name}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.dim }}>
            @{p.login} · since {p.joined}
          </div>
        </div>
      </a>

      {rows.map((r) => {
        const won = r.win === side;
        return (
          <div
            key={r.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: "7px 0",
              borderBottom: `1px solid ${C.border}`,
              fontFamily: "var(--mono)",
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: "0.12em", color: C.dim, textTransform: "uppercase" }}>
              {r.label}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: won ? C.green : C.text }}>
              {won && <span style={{ fontSize: 10, marginRight: 6 }}>▲</span>}
              {r[side]}
            </span>
          </div>
        );
      })}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {p.langs.length ? (
          p.langs.map((l) => <LangChip key={l} lang={l} shared={shared.includes(l)} />)
        ) : (
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.dim }}>
            No languages
          </span>
        )}
      </div>
    </div>
  );
}

export function Comparison({ a, b }) {
  const cmp = compareProfiles(a, b);
  return (
    <Card style={{ marginBottom: 16 }}>
      <div data-testid="comparison">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <SectionTitle style={{ marginBottom: 0 }}>
            Comparison · @{a.login} vs @{b.login}
          </SectionTitle>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: C.dim }}>
            top languages by primary language
          </span>
        </div>

        <div className="compareGrid">
          <Side p={a} rows={cmp.rows} side="a" shared={cmp.shared} />
          <Side p={b} rows={cmp.rows} side="b" shared={cmp.shared} />
        </div>

        <div
          data-testid="compare-overlap"
          style={{ marginTop: 12, fontFamily: "var(--mono)", fontSize: 11, color: C.muted }}
        >
          <span style={{ color: C.green, fontWeight: 700 }}>
            {Math.round(cmp.overlap * 100)}%
          </span>{" "}
          language overlap
          {cmp.shared.length > 0 ? ` · shared: ${cmp.shared.join(", ")}` : " · nothing in common"}
        </div>
      </div>
    </Card>
  );
}
