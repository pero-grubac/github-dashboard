import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeProfile, compareProfiles } from "../src/utils/compare.js";

const now = new Date("2026-01-01T00:00:00Z");
const repo = (language, stars = 0, fork = false) => ({ language, stargazers_count: stars, fork });

const a = summarizeProfile(
  { login: "a", public_repos: 4, followers: 10, created_at: "2020-01-01T00:00:00Z" },
  [repo("JavaScript", 3), repo("JavaScript", 1), repo("Python"), repo("Go", 5, true)],
  now,
);
const b = summarizeProfile(
  { login: "b", name: "Bee", public_repos: 2, followers: 10, created_at: "2024-01-01T00:00:00Z" },
  [repo("Python", 7), repo("Rust", 3)],
  now,
);

test("a profile summary counts stars of all repos and languages of own repos", () => {
  assert.equal(a.name, "a");
  assert.equal(a.stars, 9);
  assert.deepEqual(a.langs, ["JavaScript", "Python"]);
  assert.equal(a.joined, 2020);
  assert.equal(Math.round(a.ageYears), 6);
});

test("the comparison marks the winner of each row and the shared languages", () => {
  const cmp = compareProfiles(a, b);
  const win = Object.fromEntries(cmp.rows.map((r) => [r.label, r.win]));
  assert.deepEqual(win, { Repositories: "a", Stars: "b", Followers: null, "Account age": "a" });
  assert.deepEqual(cmp.shared, ["Python"]);
  assert.deepEqual(cmp.onlyA, ["JavaScript"]);
  assert.deepEqual(cmp.onlyB, ["Rust"]);
  assert.equal(cmp.overlap, 1 / 3);
});

test("two profiles without languages have no overlap", () => {
  const empty = summarizeProfile({ login: "x", created_at: "2020-01-01" }, [], now);
  assert.equal(compareProfiles(empty, empty).overlap, 0);
});
