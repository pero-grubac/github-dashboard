// Smoke tests against the production build. api.github.com, avatars and
// fonts are answered from fixtures, and the default profile's build-time
// snapshot is served from tests/e2e/fixtures/snapshot.json.
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const fixture = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
const SNAPSHOT = JSON.parse(fixture("snapshot.json"));
const RIVAL = fixture("rival-user.json");
const RIVAL_REPOS = fixture("rival-repos.json");
// 1×1 transparent PNG.
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);
const cors = { "access-control-allow-origin": "*" };

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.errors = errors;
  page.apiCalls = [];

  await page.route("**/data/*.json", (route) =>
    route.fulfill({ json: SNAPSHOT }),
  );
  await page.route("https://api.github.com/**", (route) => {
    const { pathname, searchParams } = new URL(route.request().url());
    page.apiCalls.push(pathname);
    const json = (body) =>
      route.fulfill({ status: 200, contentType: "application/json", headers: cors, body });
    if (pathname === "/users/octo-rival") return json(RIVAL);
    if (pathname === "/users/octo-rival/repos")
      return json(searchParams.get("page") > 1 ? "[]" : RIVAL_REPOS);
    if (pathname.endsWith("/languages")) return json("{}");
    return route.fulfill({ status: 404, headers: cors, json: { message: "Not Found" } });
  });
  await page.route("https://avatars.githubusercontent.com/**", (route) =>
    route.fulfill({ contentType: "image/png", headers: cors, body: PIXEL }),
  );
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({ contentType: "text/css", headers: cors, body: "" }),
  );
});

test.afterEach(async ({ page }) => {
  expect(page.errors, "no JavaScript errors").toEqual([]);
});

const log = (page) => page.getByTestId("term-log");

test("the default profile loads from the build-time snapshot, without API calls", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle("GitHub Dashboard");
  await expect(page.getByText(`@${SNAPSHOT.user.login}`).first()).toBeVisible();
  await expect(log(page)).toContainText("Data source: build-time snapshot · generated 2026-10-23 06:00 UTC");
  await expect(page.getByText("📌 2 PINNED")).toBeVisible();
  await expect(page.getByTestId("data-source")).toContainText("build-time snapshot");
  expect(page.apiCalls).toEqual([]);
});

test("the contribution heatmap shows a year of days with tooltips and the total", async ({ page, isMobile }) => {
  await page.goto("./");
  const heatmap = page.locator("svg.heatmap");
  await expect(heatmap).toBeVisible();
  await expect(heatmap.locator("rect")).toHaveCount(SNAPSHOT.contributions.days.length);
  await expect(page.getByTestId("heatmap-total")).toHaveText(
    `${SNAPSHOT.contributions.total.toLocaleString("en-US")} in the last year`,
  );
  const first = SNAPSHOT.contributions.days[0];
  await expect(heatmap.locator("rect").first().locator("title")).toHaveText(
    new RegExp(`contributions? on ${first.date}$`),
  );
  await expect(heatmap.locator("text", { hasText: "Jan" })).toHaveCount(1);
  // Phones scroll the calendar inside its card, starting at the latest week.
  const scrollLeft = await heatmap.locator("..").evaluate((el) => el.scrollLeft);
  if (isMobile) expect(scrollLeft).toBeGreaterThan(0);
  else expect(scrollLeft).toBe(0);
});

test("another user falls back to the live API and has no heatmap", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("svg.heatmap")).toBeVisible();
  await page.getByLabel("GitHub username").fill("octo-rival");
  await page.getByLabel("GitHub username").press("Enter");
  await expect(page.getByText("@octo-rival").first()).toBeVisible();
  await expect(log(page)).toContainText("Data source: live api.github.com");
  await expect(page.locator("svg.heatmap")).toHaveCount(0);
  expect(page.apiCalls).toContain("/users/octo-rival");
});

test("comparing two users shows a side-by-side card that stacks on phones", async ({ page, isMobile }) => {
  await page.goto("./");
  await expect(page.locator("svg.heatmap")).toBeVisible();
  await page.getByLabel("Compare with username (optional)").fill("octo-rival");
  await page.getByRole("button", { name: "GO" }).click();

  const card = page.getByTestId("comparison");
  await expect(card).toBeVisible();
  await expect(card).toContainText(`@${SNAPSHOT.user.login} vs @octo-rival`);
  await expect(page.getByTestId("compare-b")).toContainText(/Followers▲?42/);
  await expect(page.getByTestId("compare-overlap")).toContainText("shared: Java");
  await expect(log(page)).toContainText("Comparison ready");

  const a = await page.getByTestId("compare-a").boundingBox();
  const b = await page.getByTestId("compare-b").boundingBox();
  if (isMobile) expect(b.y).toBeGreaterThanOrEqual(a.y + a.height);
  else expect(Math.abs(a.y - b.y)).toBeLessThan(1);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, "no horizontal page scroll").toBeLessThanOrEqual(0);
});

test("exports: HTML and PNG download, PDF prints with controls hidden", async ({ page }) => {
  await page.addInitScript(() => {
    window.__printed = 0;
    window.print = () => window.__printed++;
  });
  await page.goto("./");
  await expect(page.locator("svg.heatmap")).toBeVisible();

  const html = page.waitForEvent("download");
  await page.getByRole("button", { name: "HTML" }).click();
  expect((await html).suggestedFilename()).toBe(`github-dashboard-${SNAPSHOT.user.login}.html`);

  const png = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG" }).click();
  expect((await png).suggestedFilename()).toBe(`github-dashboard-${SNAPSHOT.user.login}.png`);

  await page.getByRole("button", { name: "PDF" }).click();
  expect(await page.evaluate(() => window.__printed)).toBe(1);

  await page.emulateMedia({ media: "print" });
  await expect(page.getByLabel("GitHub username")).toBeHidden();
  await expect(page.getByRole("button", { name: "PDF" })).toBeHidden();
  await expect(log(page)).toBeHidden();
  await expect(page.locator("svg.heatmap")).toBeVisible();
});
