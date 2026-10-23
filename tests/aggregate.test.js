import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateLanguages, aggregateTopics } from "../src/api/loadStats.js";

test("languages are counted per repository, top 8, most used first", () => {
  const repos = [
    { languages: { JavaScript: 10, CSS: 2 } },
    { languages: { JavaScript: 5 } },
    { languages: {}, language: "Python" },
    { languages: {}, language: null },
    ...["A", "B", "C", "D", "E", "F", "G"].map((l) => ({ languages: { [l]: 1 } })),
  ];
  const langs = aggregateLanguages(repos);
  assert.equal(langs.length, 8);
  assert.deepEqual(langs[0], { lang: "JavaScript", count: 2 });
  assert.ok(langs.some((l) => l.lang === "CSS"));
  assert.ok(langs.some((l) => l.lang === "Python"), "falls back to the primary language");
});

test("topics are split into frameworks and tools, unknown topics ignored", () => {
  const { frameworks, tools } = aggregateTopics([
    { topics: ["react", "docker", "my-pet-project"] },
    { topics: ["react", "vite"] },
    { topics: [] },
    {},
  ]);
  assert.deepEqual(frameworks, [{ lang: "react", count: 2 }]);
  assert.deepEqual(tools.map((t) => t.lang).sort(), ["docker", "vite"]);
});
