import { test } from "node:test";
import assert from "node:assert/strict";
import { heatmapLayout, levelFor } from "../src/utils/heatmap.js";

// `n` consecutive days starting at `start` (YYYY-MM-DD), counts from `count(i)`.
function days(start, n, count = () => 0) {
  const t0 = Date.parse(start + "T00:00:00Z");
  return Array.from({ length: n }, (_, i) => ({
    date: new Date(t0 + i * 864e5).toISOString().slice(0, 10),
    count: count(i),
  }));
}

test("levels split the busiest day into quarters, zero stays empty", () => {
  assert.equal(levelFor(0, 8), 0);
  assert.equal(levelFor(1, 8), 1);
  assert.equal(levelFor(2, 8), 1);
  assert.equal(levelFor(3, 8), 2);
  assert.equal(levelFor(8, 8), 4);
  assert.equal(levelFor(5, 0), 0);
});

test("weeks are columns with Sunday on top, starting mid-week", () => {
  // 2025-10-22 is a Wednesday.
  const { cells, cols } = heatmapLayout(days("2025-10-22", 10));
  assert.deepEqual([cells[0].col, cells[0].row], [0, 3]);
  // 2025-10-26 is the next Sunday: first row of the second column.
  const sunday = cells.find((c) => c.date === "2025-10-26");
  assert.deepEqual([sunday.col, sunday.row], [1, 0]);
  assert.equal(cols, 2);
});

test("a full year fits GitHub's 53 columns with one label per month", () => {
  const year = days("2025-10-19", 371, (i) => i % 5);
  const { cells, cols, months, max, total } = heatmapLayout(year);
  assert.equal(cells.length, 371);
  assert.equal(cols, 53);
  assert.equal(max, 4);
  assert.equal(total, year.reduce((s, d) => s + d.count, 0));
  // October only has two columns before November, too few for a label.
  assert.equal(months.length, 12);
  assert.deepEqual(months.slice(0, 3).map((m) => m.label), ["Nov", "Dec", "Jan"]);
  // Labels sit above the first week whose Sunday is in the new month.
  assert.equal(months[0].col, 2); // Sunday 2025-11-02
  assert.ok(months.every((m, i) => i === 0 || m.col > months[i - 1].col));
});

test("a cramped first month label is dropped, input order does not matter", () => {
  // Starts on Thursday 2026-01-29; February begins in the next column.
  const { months } = heatmapLayout(days("2026-01-29", 40).reverse());
  assert.equal(months[0].label, "Feb");
});

test("no days, no layout", () => {
  assert.deepEqual(heatmapLayout([]), { cells: [], months: [], cols: 0, max: 0, total: 0 });
});
