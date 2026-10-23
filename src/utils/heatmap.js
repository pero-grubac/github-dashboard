const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// 0 for no contributions, otherwise 1–4 by quarter of the busiest day.
export function levelFor(count, max) {
  if (!count || !max) return 0;
  return Math.min(4, Math.max(1, Math.ceil((count / max) * 4)));
}

// Lays out a contribution calendar the way GitHub does: one column per week
// (Sunday on top), a month label above the first full week of each month.
// `days` is [{ date: "YYYY-MM-DD", count }] in any order.
export function heatmapLayout(days) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  if (!sorted.length) return { cells: [], months: [], cols: 0, max: 0, total: 0 };

  const offset = new Date(sorted[0].date + "T00:00:00Z").getUTCDay();
  const max = Math.max(...sorted.map((d) => d.count));
  const cells = sorted.map((d, i) => ({
    date: d.date,
    count: d.count,
    col: Math.floor((i + offset) / 7),
    row: (i + offset) % 7,
    level: levelFor(d.count, max),
  }));
  const cols = cells[cells.length - 1].col + 1;

  // A column gets a label when its first day starts a new month. The first
  // label is dropped if the next one follows too closely to be readable.
  const months = [];
  let prevMonth = null;
  for (const cell of cells) {
    if (cell.row !== 0 && cell !== cells[0]) continue;
    const month = Number(cell.date.slice(5, 7)) - 1;
    if (month !== prevMonth) {
      months.push({ col: cell.col, label: MONTHS[month] });
      prevMonth = month;
    }
  }
  if (months.length > 1 && months[1].col - months[0].col < 3) months.shift();

  const total = sorted.reduce((s, d) => s + d.count, 0);
  return { cells, months, cols, max, total };
}
