const BASE = "https://api.github.com";

export async function ghFetch(path) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  // No token in the browser: authenticated data (pinned repositories,
  // contributions) comes from the build-time snapshot instead.
  const headers = { Accept: "application/vnd.github.v3+json" };

  const attempts = [
    () => fetch(url, { headers }),
    () => fetch("https://corsproxy.io/?" + encodeURIComponent(url)),
    () =>
      fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(url)),
  ];

  let lastErr;
  for (const fn of attempts) {
    try {
      const r = await fn();
      if (!r.ok) {
        if (r.headers.get("X-RateLimit-Remaining") === "0")
          throw new Error(
            "GitHub rate limit reached (60 req/h). Try again later.",
          );
        continue;
      }
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
  let page = 1,
    out = [];
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
