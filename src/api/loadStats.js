import { ghFetch, fetchAll, fetchPinned } from "./ghFetch";

export async function loadStats(username) {
  const [user, repos, pinned] = await Promise.all([
    ghFetch(`/users/${username}`),
    fetchAll(`/users/${username}/repos`),
    fetchPinned(username),
  ]);

  // Language distribution
  const lc = {};
  repos.forEach((r) => {
    if (r.language) lc[r.language] = (lc[r.language] || 0) + 1;
  });
  const langs = Object.entries(lc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang, count]) => ({ lang, count }));

  // Top repos: pinned first, then scored originals
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
    .slice(0, Math.max(0, 10 - pinnedRepos.length))
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

  // Repos by year chart data
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
    .slice(0, 10);

  return {
    user,
    repos,
    langs,
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
