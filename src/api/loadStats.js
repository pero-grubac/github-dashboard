import { ghFetch, fetchAll, fetchPinned } from "./ghFetch";

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

async function fetchLangBytes(repos) {
  const targets = repos.filter((r) => !r.fork).slice(0, 60);
  const results = await Promise.allSettled(
    targets.map((r) => ghFetch(`/repos/${r.full_name}/languages`)),
  );
  const totals = {};
  results.forEach((res) => {
    if (res.status !== "fulfilled") return;
    Object.entries(res.value).forEach(([lang, bytes]) => {
      totals[lang] = (totals[lang] || 0) + bytes;
    });
  });
  return totals;
}

function aggregateTopics(repos) {
  const frameworkMap = {};
  const toolMap = {};
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

export async function loadStats(username) {
  const [user, repos, pinned] = await Promise.all([
    ghFetch(`/users/${username}`),
    fetchAll(`/users/${username}/repos`),
    fetchPinned(username),
  ]);

  const langBytes = await fetchLangBytes(repos);
  const totalBytes = Object.values(langBytes).reduce((s, b) => s + b, 0);
  const langs = Object.entries(langBytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang, bytes]) => ({
      lang,
      count: Math.round((bytes / totalBytes) * 100),
      bytes,
    }));

  const { frameworks, tools } = aggregateTopics(repos);

  const score = (r) =>
    r.stargazers_count * 3 +
    r.forks_count * 2 +
    (r.fork ? 0 : 5) +
    (r.description ? 2 : 0);

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
  const otherTopRepos = [...repos]
    .filter((r) => !r.fork && !pinnedNames.has(r.name))
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
  repos.forEach((r) => {
    const y = new Date(r.created_at).getFullYear();
    byYear[y] = (byYear[y] || 0) + 1;
  });
  const reposByYear = Object.entries(byYear)
    .sort((a, b) => +a[0] - +b[0])
    .map(([year, count]) => ({ year: +year, count }));

  const recentRepos = [...repos]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 6);

  return {
    user,
    repos,
    langs,
    frameworks,
    tools,
    topRepos,
    reposByYear,
    recentRepos,
    originalCount: repos.filter((r) => !r.fork).length,
    forkCount: repos.filter((r) => r.fork).length,
    totalStars: repos.reduce((s, r) => s + r.stargazers_count, 0),
    totalForks: repos.reduce((s, r) => s + r.forks_count, 0),
    pinnedCount: pinnedRepos.length,
  };
}
