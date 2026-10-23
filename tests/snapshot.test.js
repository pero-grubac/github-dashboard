import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSnapshot, fromGraphQL, pickRepo } from "../scripts/snapshot.mjs";
import { isSnapshot } from "../src/api/snapshot.js";
import { buildStats } from "../src/api/loadStats.js";
import { sourceLabel } from "../src/utils/source.js";

const user = { login: "octo", public_repos: 2 };
const repos = [
  { name: "app", full_name: "octo/app", fork: false, language: "Go", stargazers_count: 1, forks_count: 0, created_at: "2024-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z", owner: { big: "object" } },
  { name: "fork", full_name: "octo/fork", fork: true, language: "C", stargazers_count: 0, forks_count: 0, created_at: "2025-01-01T00:00:00Z", updated_at: "2025-02-01T00:00:00Z" },
];
const graph = {
  user: {
    pinnedItems: { nodes: [{ name: "pinned", stargazerCount: 9, forkCount: 1, primaryLanguage: { name: "Rust" }, url: "https://github.com/octo/pinned", description: "d" }, {}] },
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: 3,
        weeks: [
          { contributionDays: [{ date: "2025-01-05", contributionCount: 1 }] },
          { contributionDays: [{ date: "2025-01-12", contributionCount: 2 }] },
        ],
      },
    },
  },
};

test("repositories are trimmed to the fields the dashboard reads", () => {
  const r = pickRepo(repos[0]);
  assert.equal(r.owner, undefined);
  assert.equal(r.full_name, "octo/app");
  assert.equal(r.topics, null);
});

test("the GraphQL answer becomes pinned repos and a flat contribution list", () => {
  const { pinned, contributions } = fromGraphQL(graph);
  assert.deepEqual(pinned.map((p) => p.name), ["pinned"]);
  assert.deepEqual(contributions, {
    total: 3,
    days: [{ date: "2025-01-05", count: 1 }, { date: "2025-01-12", count: 2 }],
  });
  assert.deepEqual(fromGraphQL(null), { pinned: [], contributions: null });
});

test("an unauthenticated snapshot is still valid, just without GraphQL data", () => {
  const snap = buildSnapshot({ user, repos, languages: {}, graph: null, now: new Date("2026-01-01T00:00:00Z") });
  assert.equal(snap.generatedAt, "2026-01-01T00:00:00.000Z");
  assert.equal(snap.authenticated, false);
  assert.deepEqual(snap.pinned, []);
  assert.equal(snap.contributions, null);
  assert.ok(isSnapshot(JSON.parse(JSON.stringify(snap))));
});

test("only real snapshots are accepted (not the dev server's HTML fallback)", () => {
  assert.equal(isSnapshot(null), false);
  assert.equal(isSnapshot("<!doctype html>"), false);
  assert.equal(isSnapshot({ user: { login: "x" }, repos: [] }), false);
});

test("stats from a snapshot put pinned repositories first", () => {
  const snap = buildSnapshot({ user, repos, languages: { "octo/app": { Go: 10, Shell: 2 } }, graph });
  const stats = buildStats(snap);
  assert.equal(stats.pinnedCount, 1);
  assert.deepEqual(stats.topRepos.map((r) => [r.name, r.pinned]), [["pinned", true], ["app", false]]);
  assert.deepEqual(stats.langs.map((l) => l.lang).sort(), ["Go", "Shell"]);
  assert.equal(stats.originalCount, 1);
  assert.equal(stats.forkCount, 1);
});

test("the data source label names the snapshot time or the live API", () => {
  assert.equal(
    sourceLabel({ kind: "snapshot", generatedAt: "2026-10-23T06:00:12.000Z" }),
    "build-time snapshot · generated 2026-10-23 06:00 UTC",
  );
  assert.match(sourceLabel({ kind: "live" }), /live api\.github\.com/);
  assert.match(sourceLabel(undefined), /live/);
});
