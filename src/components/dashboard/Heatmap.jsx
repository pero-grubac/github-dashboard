import { useEffect, useMemo, useRef } from "react";
import { C } from "../../constants/theme";
import { Card } from "../ui/Card";
import { SectionTitle } from "../ui/index";
import { heatmapLayout } from "../../utils/heatmap";

const CELL = 10;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT = 28;
const TOP = 16;
const LEVELS = [C.surface, `${C.green}38`, `${C.green}70`, `${C.green}b0`, C.green];
const WEEKDAYS = [
  [1, "Mon"],
  [3, "Wed"],
  [5, "Fri"],
];

const plural = (n) => `${n} contribution${n === 1 ? "" : "s"}`;

export function Heatmap({ contributions }) {
  const scroller = useRef(null);
  const layout = useMemo(
    () => heatmapLayout(contributions.days),
    [contributions.days],
  );
  // On narrow screens the calendar scrolls; start at the most recent weeks.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [layout]);
  if (!layout.cells.length) return null;

  const width = LEFT + layout.cols * STEP;
  const height = TOP + 7 * STEP;
  const total = contributions.total ?? layout.total;

  return (
    <Card style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <SectionTitle style={{ marginBottom: 0 }}>Contributions</SectionTitle>
        <span
          data-testid="heatmap-total"
          style={{ fontFamily: "var(--mono)", fontSize: 11, color: C.muted }}
        >
          <span style={{ color: C.green, fontWeight: 700 }}>
            {total.toLocaleString("en-US")}
          </span>{" "}
          in the last year
        </span>
      </div>

      <div ref={scroller} style={{ overflowX: "auto" }}>
        <svg
          className="heatmap"
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          role="img"
          aria-label={`${plural(total)} in the last year`}
          style={{ display: "block", minWidth: 620 }}
        >
          {layout.months.map((m) => (
            <text
              key={`${m.col}-${m.label}`}
              x={LEFT + m.col * STEP}
              y={10}
              fill={C.dim}
              fontSize={9}
              fontFamily="var(--mono)"
            >
              {m.label}
            </text>
          ))}
          {WEEKDAYS.map(([row, label]) => (
            <text
              key={label}
              x={0}
              y={TOP + row * STEP + CELL - 1}
              fill={C.dim}
              fontSize={9}
              fontFamily="var(--mono)"
            >
              {label}
            </text>
          ))}
          {layout.cells.map((c) => (
            <rect
              key={c.date}
              x={LEFT + c.col * STEP}
              y={TOP + c.row * STEP}
              width={CELL}
              height={CELL}
              rx={2}
              fill={LEVELS[c.level]}
              stroke={c.level ? "none" : C.border}
              strokeWidth={c.level ? 0 : 1}
              data-level={c.level}
            >
              <title>{`${plural(c.count)} on ${c.date}`}</title>
            </rect>
          ))}
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 4,
          marginTop: 10,
          fontFamily: "var(--mono)",
          fontSize: 10,
          color: C.dim,
        }}
      >
        <span style={{ marginRight: 4 }}>Less</span>
        {LEVELS.map((color, i) => (
          <span
            key={i}
            style={{
              width: CELL,
              height: CELL,
              borderRadius: 2,
              background: color,
              border: i ? "none" : `1px solid ${C.border}`,
            }}
          />
        ))}
        <span style={{ marginLeft: 4 }}>More</span>
      </div>
    </Card>
  );
}
