const YEAR_MS = 1000 * 60 * 60 * 24 * 365.25;

// Both sides of a comparison are summarised the same way, from the user and
// the repository list, so the numbers are like for like.
export function summarizeProfile(user, repos, now = new Date()) {
  const own = repos.filter((r) => !r.fork);
  const counts = {};
  own.forEach((r) => {
    if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  });
  const created = new Date(user.created_at);
  return {
    login: user.login,
    name: user.name || user.login,
    avatar: user.avatar_url,
    url: user.html_url,
    repos: user.public_repos ?? repos.length,
    stars: repos.reduce((s, r) => s + (r.stargazers_count || 0), 0),
    followers: user.followers ?? 0,
    langs: Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([lang]) => lang),
    joined: created.getUTCFullYear(),
    ageYears: Math.max(0, (now - created) / YEAR_MS),
  };
}

const winner = (a, b) => (a === b ? null : a > b ? "a" : "b");

export function compareProfiles(a, b) {
  const shared = a.langs.filter((l) => b.langs.includes(l));
  return {
    rows: [
      { label: "Repositories", a: a.repos, b: b.repos, win: winner(a.repos, b.repos) },
      { label: "Stars", a: a.stars, b: b.stars, win: winner(a.stars, b.stars) },
      { label: "Followers", a: a.followers, b: b.followers, win: winner(a.followers, b.followers) },
      {
        label: "Account age",
        a: `${a.ageYears.toFixed(1)} y`,
        b: `${b.ageYears.toFixed(1)} y`,
        win: winner(Math.round(a.ageYears * 10), Math.round(b.ageYears * 10)),
      },
    ],
    shared,
    onlyA: a.langs.filter((l) => !shared.includes(l)),
    onlyB: b.langs.filter((l) => !shared.includes(l)),
    overlap: shared.length / (new Set([...a.langs, ...b.langs]).size || 1),
  };
}
