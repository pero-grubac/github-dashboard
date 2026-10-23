import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDashboardHTML, esc } from "../src/utils/exportHTML.js";

const evil = '<img src=x onerror="alert(1)">';
const data = {
  user: { login: "octo", name: evil, bio: `<script>alert(1)</script>`, location: evil, avatar_url: "https://x/a.png" },
  langs: [{ lang: "JavaScript", count: 3 }],
  reposByYear: [{ year: 2025, count: 3 }],
  topRepos: [{ name: "repo", desc: evil, url: "https://github.com/octo/repo", lang: "Go", stars: 1, forks: 0, pinned: false }],
  recentRepos: [{ name: "<b>recent</b>", updated_at: "2026-01-01T00:00:00Z", language: "Go" }],
  totalStars: 1,
  frameworks: [],
  tools: [],
};

test("esc escapes the HTML special characters", () => {
  assert.equal(esc(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
  assert.equal(esc(null), "");
});

test("user-controlled text cannot inject markup into the export", () => {
  const html = buildDashboardHTML(data);
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(!html.includes('<img src=x onerror="alert(1)">'));
  assert.ok(!html.includes("<b>recent</b>"));
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
});

test("the export is a complete document", () => {
  const html = buildDashboardHTML(data);
  assert.match(html, /^<!DOCTYPE html>/);
  assert.match(html, /<\/html>$/);
});
