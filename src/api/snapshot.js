import { DEFAULT_USER } from "../constants/config.js";

// A snapshot is the raw GitHub data written by `npm run snapshot` at build
// time (public/data/<user>.json). Anything else, e.g. the dev server's
// index.html fallback for a missing file, is ignored.
export function isSnapshot(json) {
  return Boolean(
    json &&
      typeof json === "object" &&
      json.user?.login &&
      Array.isArray(json.repos) &&
      typeof json.generatedAt === "string",
  );
}

export async function loadSnapshot(username) {
  if (username.trim().toLowerCase() !== DEFAULT_USER.toLowerCase()) return null;
  try {
    const r = await fetch(
      `${import.meta.env.BASE_URL}data/${DEFAULT_USER.toLowerCase()}.json`,
      { cache: "no-cache" },
    );
    if (!r.ok) return null;
    const json = await r.json();
    return isSnapshot(json) ? json : null;
  } catch {
    return null;
  }
}
