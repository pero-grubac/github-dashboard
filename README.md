# 📊 GitHub Dashboard

A dark-themed developer analytics dashboard that visualizes any GitHub user's public profile — repositories, languages, stars, and activity over time — in a clean terminal-inspired UI.

[![Live Demo](https://img.shields.io/badge/📊_Live_Demo-github--dashboard-5b8af5?style=for-the-badge)](https://pero-grubac.github.io/github-dashboard/)

---

## Features

- **Profile overview** — avatar, bio, follower/following counts, account age, total stars
- **Language breakdown** — top 8 languages by repo count with color-coded progress bars
- **Activity chart** — repositories created per year (D3 bar chart)
- **Top repositories** — pinned repos listed first, then ranked by stars, forks, and originality
- **Recent activity** — 6 most recently updated repositories with relative timestamps
- **HTML export** — download a self-contained static snapshot of any dashboard
- **CORS fallback** — automatically retries via proxy if the GitHub API blocks the request

---

## How it works

### Data pipeline

All data is fetched client-side from the GitHub public API — no backend, no token required.

#### 1. Parallel fetch

Three requests fire simultaneously:

- `GET /users/:username` — profile info (bio, followers, avatar, join date)
- `GET /users/:username/repos` — full repo list, paginated (100/page) until exhausted
- `GraphQL /graphql → pinnedItems` — pinned repositories (name, stars, language, URL)

#### 2. Aggregation

From the raw repo list the following are derived:

| Metric | Method |
|--------|--------|
| Language distribution | Count repos per language, take top 8 |
| Repos by year | Group `created_at` by year |
| Top repos | Pinned first, then scored originals |
| Recent repos | Sort by `updated_at`, take 6 |

#### 3. Repo scoring

Non-forked repos not already pinned are ranked by:

```
score = stars × 3 + forks × 2 + 5 (original) + 2 (has description)
```

Up to 9 total top repos are shown (pinned + scored).

#### 4. CORS fallback chain

If the direct GitHub API call fails (e.g. browser CORS block), the fetcher retries automatically through two public proxies before surfacing an error.

---

## Project structure

```
github-dashboard/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── App.jsx                        # Root component, state, load flow
    ├── main.jsx
    ├── index.css
    ├── App.css
    ├── api/
    │   ├── ghFetch.js                 # REST + GraphQL fetchers, CORS fallback
    │   └── loadStats.js              # Aggregates raw data into dashboard stats
    ├── components/
    │   ├── charts/
    │   │   └── index.jsx             # D3 language bar + repos-by-year chart
    │   ├── dashboard/
    │   │   ├── Header.jsx            # Search bar + export button
    │   │   ├── ProfileCard.jsx       # Avatar, bio, stats summary
    │   │   ├── StatsRow.jsx          # Language + activity charts row
    │   │   ├── TopRepos.jsx          # Pinned + top scored repos grid
    │   │   └── RecentRepos.jsx       # Recently updated repos list
    │   └── ui/
    │       ├── index.jsx             # TermLog, ExportBtn
    │       ├── Card.jsx
    │       └── Stat.jsx
    ├── constants/
    │   ├── config.js                 # DEFAULT_USER
    │   └── theme.js                  # Color tokens + language color map
    └── utils/
        └── exportHTML.js             # Serializes dashboard to standalone HTML
```

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), type any GitHub username, press **GO**.

### Change the default user

Edit `src/constants/config.js`:

```js
export const DEFAULT_USER = "your-username";
```

---

## Deploy to GitHub Pages

1. Set `base` in `vite.config.js` to match your repo name (e.g. `"/github-dashboard/"`)
2. Run `npm run build`
3. Push the `dist/` folder to the `gh-pages` branch, or use the GitHub Actions workflow below

**GitHub Actions (recommended):**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Site will be live at `https://<your-username>.github.io/github-dashboard/`

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Tech stack

| Tool | Version | Role |
|------|---------|------|
| React | 19 | UI framework |
| Vite | 8 | Dev server & bundler |
| D3 | 7 | Charts |
| GitHub REST API | v3 | User & repo data |
| GitHub GraphQL API | v4 | Pinned repositories |

---

## Known limitations

- Only **public** data is fetched — private repos and private contributions are not visible
- The GraphQL pinned-repos endpoint may return empty results without a personal access token due to rate limiting
- Adding `Authorization: Bearer <token>` to the headers in `ghFetch.js` raises the limit from 60 to 5 000 requests/hour

---

_This is an unofficial tool. GitHub is a trademark of GitHub, Inc._