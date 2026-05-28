export async function ghFetch(path) {
  const url = `https://api.github.com${path}`;
  const attempts = [
    () => fetch(url, { headers: { Accept: "application/vnd.github+json" } }),
    () => fetch("https://corsproxy.io/?" + encodeURIComponent(url)),
    () => fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(url)),
  ];
  let lastErr;
  for (const fn of attempts) {
    try {
      const r = await fn();
      if (!r.ok) continue;
      const json = await r.json();
      if (json.message) throw new Error("GitHub: " + json.message);
      return json;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("All attempts failed");
}

export async function fetchAll(path) {
  let page = 1, out = [];
  while (true) {
    const sep = path.includes("?") ? "&" : "?";
    const data = await ghFetch(`${path}${sep}per_page=100&page=${page}`);
    if (!Array.isArray(data) || !data.length) break;
    out = out.concat(data);
    if (data.length < 100) break;
    page++;
  }
  return out;
}

export async function fetchPinned(username) {
  const query = `{ user(login: "${username}") { pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { name description stargazerCount forkCount primaryLanguage { name } url } } } } }`;
  try {
    const r = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const j = await r.json();
    if (j?.data?.user?.pinnedItems?.nodes) return j.data.user.pinnedItems.nodes;
  } catch {}
  return [];
}
