import { ghFetch, fetchAll, fetchPinned } from "./ghFetch";

const CACHE_KEY = "gh-dashboard-cache";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const FRAMEWORKS = new Set([
  "react",
  "vue",
  "angular",
  "nextjs",
  "nuxt",
  "spring",
  "spring-boot",
  "dotnet",
  "asp-net",
  "aspnet",
  "django",
  "flask",
  "fastapi",
  "flutter",
  "android",
  "express",
  "nestjs",
  "nodejs",
  "node",
  "mui",
  "tailwind",
  "bootstrap",
  "pytorch",
  "tensorflow",
  "keras",
]);

const TOOLS = new Set([
  "docker",
  "kubernetes",
  "nginx",
  "postgresql",
  "mysql",
  "sqlite",
  "mongodb",
  "redis",
  "mssql",
  "rabbitmq",
  "kafka",
  "github-actions",
  "ci-cd",
  "webpack",
  "vite",
  "junit",
  "selenium",
  "jest",
  "postman",
  "swagger",
  "gcp",
  "aws",
  "azure",
]);

function loadCache(username) {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}-${username}`);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function saveCache(username, data) {
  try {
    localStorage.setItem(
      `${CACHE_KEY}-${username}`,
      JSON.stringify({ ts: Date.now(), data }),
    );
  } catch {}
}

function aggregateLanguages(repos) {
  const langMap = {};
  repos.forEach((r) => {
    const langs = Object.keys(r.languages || {});
    if (langs.length === 0 && r.language) langs.push(r.language);
    langs.forEach((lang) => {
      langMap[lang] = (langMap[lang] || 0) + 1;
    });
  });
  return Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang, count]) => ({ lang, count }));
}

function aggregateTopics(repos) {
  const frameworkMap = {},
    toolMap = {};
  repos.forEach((r) => {
    (r.topics || []).forEach((topic) => {
      if (FRAMEWORKS.has(topic))
        frameworkMap[topic] = (frameworkMap[topic] || 0) + 1;
      else if (TOOLS.has(topic)) toolMap[topic] = (toolMap[topic] || 0) + 1;
    });
  });
  const toArray = (map) =>
    Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ lang: name, count }));
  return { frameworks: toArray(frameworkMap), tools: toArray(toolMap) };
}

export async function loadStats(username, onProgress, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = loadCache(username);
    if (cached) {
      onProgress("Loaded from cache (1h TTL) ✓");
      return cached;
    }
  }

  onProgress(`Connecting to github.com/${username}...`);
  const [user, rawRepos, pinned] = await Promise.all([
    ghFetch(`/users/${username}`),
    fetchAll(`/users/${username}/repos`),
    fetchPinned(username),
  ]);

  // Sequential language fetch per repo (same as dev-timeline)
  const nonForks = rawRepos.filter((r) => !r.fork);
  onProgress(`Scanning ${nonForks.length} repositories...`);
  const enriched = await Promise.all(
    nonForks.map(async (repo) => {
      let languages = {};
      try {
        languages = await ghFetch(`/repos/${repo.full_name}/languages`);
      } catch {}
      return { ...repo, languages };
    }),
  );
  onProgress("Languages loaded ✓");
  const langs = aggregateLanguages(enriched);
  const { frameworks, tools } = aggregateTopics(enriched);

  const score = (r) =>
    r.stargazers_count * 3 + r.forks_count * 2 + 5 + (r.description ? 2 : 0);
  const pinnedNames = new Set(pinned.map((p) => p.name));
  const pinnedRepos = pinned.map((p) => ({
    name: p.name,
    stars: p.stargazerCount,
    forks: p.forkCount,
    lang: p.primaryLanguage?.name,
    url: p.url,
    desc: p.description,
    pinned: true,
  }));
  const otherTopRepos = enriched
    .filter((r) => !pinnedNames.has(r.name))
    .sort((a, b) => score(b) - score(a))
    .slice(0, Math.max(0, 9 - pinnedRepos.length))
    .map((r) => ({
      name: r.name,
      stars: r.stargazers_count,
      forks: r.forks_count,
      lang: r.language,
      url: r.html_url,
      desc: r.description,
      pinned: false,
    }));
  const topRepos = [...pinnedRepos, ...otherTopRepos];

  const byYear = {};
  rawRepos.forEach((r) => {
    const y = new Date(r.created_at).getFullYear();
    byYear[y] = (byYear[y] || 0) + 1;
  });
  const reposByYear = Object.entries(byYear)
    .sort((a, b) => +a[0] - +b[0])
    .map(([year, count]) => ({ year: +year, count }));

  const recentRepos = [...rawRepos]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 6);

  const result = {
    user,
    repos: rawRepos,
    langs,
    frameworks,
    tools,
    topRepos,
    reposByYear,
    recentRepos,
    originalCount: nonForks.length,
    forkCount: rawRepos.filter((r) => r.fork).length,
    totalStars: rawRepos.reduce((s, r) => s + r.stargazers_count, 0),
    totalForks: rawRepos.reduce((s, r) => s + r.forks_count, 0),
    pinnedCount: pinnedRepos.length,
  };

  saveCache(username, result);
  return result;
}
