// Build-time snapshot of the default profile: `npm run snapshot`
//
// Writes public/data/<user>.json with the raw data the dashboard needs, so the
// deployed site never has to carry a token. With GITHUB_TOKEN set it also
// stores the pinned repositories and the contribution calendar (GraphQL only
// works authenticated). Without a token it still runs, with a warning.
//
//   GITHUB_TOKEN=github_pat_xxxx SNAPSHOT_USER=octocat npm run snapshot
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DEFAULT_USER } from "../src/constants/config.js";

const API = "https://api.github.com";
const ROOT = fileURLToPath(new URL("../", import.meta.url));

// Only the repository fields the dashboard reads, to keep the file small.
const REPO_FIELDS = [
  "name",
  "full_name",
  "fork",
  "language",
  "topics",
  "description",
  "html_url",
  "stargazers_count",
  "forks_count",
  "created_at",
  "updated_at",
];

export const pickRepo = (repo) =>
  Object.fromEntries(REPO_FIELDS.map((k) => [k, repo[k] ?? null]));

const GRAPHQL_QUERY = `query ($login: String!) {
  user(login: $login) {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes { ... on Repository { name description stargazerCount forkCount primaryLanguage { name } url } }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

// GraphQL answer → { pinned, contributions } in the snapshot's shape.
export function fromGraphQL(data) {
  const user = data?.user;
  if (!user) return { pinned: [], contributions: null };
  const calendar = user.contributionsCollection?.contributionCalendar;
  const days = (calendar?.weeks || []).flatMap((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
  );
  return {
    pinned: (user.pinnedItems?.nodes || []).filter((n) => n?.name),
    contributions: days.length
      ? { total: calendar.totalContributions, days }
      : null,
  };
}

export function buildSnapshot({ user, repos, languages, graph, now = new Date() }) {
  const { pinned, contributions } = graph ? fromGraphQL(graph) : { pinned: [], contributions: null };
  return {
    generatedAt: now.toISOString(),
    authenticated: Boolean(graph),
    user,
    repos: repos.map(pickRepo),
    languages,
    pinned,
    contributions,
  };
}

function client(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "github-dashboard-snapshot",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  async function rest(path) {
    const r = await fetch(API + path, { headers });
    if (!r.ok) {
      const limited = r.headers.get("x-ratelimit-remaining") === "0";
      throw new Error(`${path}: HTTP ${r.status}${limited ? " (rate limit reached)" : ""}`);
    }
    return r.json();
  }

  async function all(path) {
    const out = [];
    for (let page = 1; ; page++) {
      const data = await rest(`${path}?per_page=100&page=${page}`);
      out.push(...data);
      if (data.length < 100) return out;
    }
  }

  async function graphql(query, variables) {
    const r = await fetch(API + "/graphql", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const json = await r.json();
    if (!r.ok || json.errors) {
      throw new Error(`GraphQL: ${json.errors?.[0]?.message || json.message || r.status}`);
    }
    return json.data;
  }

  return { rest, all, graphql };
}

async function main() {
  if (existsSync(ROOT + ".env.local")) process.loadEnvFile(ROOT + ".env.local");
  const token = process.env.GITHUB_TOKEN?.trim() || "";
  const login = (process.env.SNAPSHOT_USER?.trim() || DEFAULT_USER).toLowerCase();
  const gh = client(token);

  if (!token) {
    console.warn(
      "warning: GITHUB_TOKEN is not set. Running unauthenticated (60 requests/hour);\n" +
        "         the snapshot will have no pinned repositories and no contribution heatmap.",
    );
  }

  console.log(`snapshot: ${login}`);
  const [user, repos] = await Promise.all([
    gh.rest(`/users/${login}`),
    gh.all(`/users/${login}/repos`),
  ]);

  const languages = {};
  for (const repo of repos.filter((r) => !r.fork)) {
    try {
      languages[repo.full_name] = await gh.rest(`/repos/${repo.full_name}/languages`);
    } catch (e) {
      console.warn(`warning: ${e.message}; using the primary language`);
    }
  }

  let graph = null;
  if (token) {
    try {
      graph = await gh.graphql(GRAPHQL_QUERY, { login });
    } catch (e) {
      console.warn(`warning: ${e.message}; no pinned repositories or heatmap`);
    }
  }

  const snapshot = buildSnapshot({ user, repos, languages, graph });
  const dir = ROOT + "public/data/";
  await mkdir(dir, { recursive: true });
  await writeFile(dir + `${login}.json`, JSON.stringify(snapshot));

  console.log(
    `wrote public/data/${login}.json: ${repos.length} repos, ` +
      `${snapshot.pinned.length} pinned, ` +
      (snapshot.contributions
        ? `${snapshot.contributions.total} contributions`
        : "no contribution calendar"),
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`snapshot failed: ${e.message}`);
    process.exit(1);
  });
}
