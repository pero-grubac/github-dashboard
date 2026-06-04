<div align="center">

# 📊 GitHub Dashboard

![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)
![D3](https://img.shields.io/badge/D3.js-7-f9a03c?style=flat-square&logo=d3.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-f7df1e?style=flat-square&logo=javascript&logoColor=black)
![HTML](https://img.shields.io/badge/HTML-5-e34f26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-3-1572b6?style=flat-square&logo=css3&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-deployed-4c1?style=flat-square&logo=github&logoColor=white)
![GitHub API](https://img.shields.io/badge/GitHub_API-v3%20%2F%20v4-181717?style=flat-square&logo=github&logoColor=white)

[![Live Demo](https://img.shields.io/badge/📊_Live_Demo-github--dashboard-5b8af5?style=for-the-badge)](https://pero-grubac.github.io/github-dashboard/)

</div>

---

## 📌 Project Overview

**GitHub Dashboard** is a dark-themed developer analytics dashboard that visualizes any GitHub user's public profile — repositories, languages, stars, and activity over time — in a clean terminal-inspired UI. All data is fetched client-side from the GitHub public API with no backend and no token required.

---

## ✨ Features

- 👤 **Profile overview** — Avatar, bio, follower/following counts, account age, total stars
- 🌐 **Language breakdown** — Top 8 languages by repo count with color-coded progress bars
- 📊 **Activity chart** — Repositories created per year (D3 bar chart)
- 📌 **Top repositories** — Pinned repos listed first, then ranked by stars, forks, and originality
- 🕒 **Recent activity** — 6 most recently updated repositories with relative timestamps
- 📄 **HTML export** — Download a self-contained static snapshot of any dashboard
- 🔁 **CORS fallback** — Automatically retries via proxy if the GitHub API blocks the request

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| React 19 | UI framework |
| Vite 8 | Dev server & bundler |
| D3.js 7 | Charts |
| GitHub REST API v3 | User & repo data |
| GitHub GraphQL API v4 | Pinned repositories |
| GitHub Pages | Hosting |

---

## 🚀 Setup & Run

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/pero-grubac/github-dashboard.git
cd github-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), type any GitHub username, and press **GO**.

### 4. Change the default user

Edit `src/constants/config.js`:

```js
export const DEFAULT_USER = "your-username";
```

---

## 📁 Project Structure

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

## ⚙️ How it works

### Data pipeline

#### 1. Parallel fetch

Three requests fire simultaneously:

- `GET /users/:username` — profile info (bio, followers, avatar, join date)
- `GET /users/:username/repos` — full repo list, paginated (100/page) until exhausted
- `GraphQL /graphql → pinnedItems` — pinned repositories (name, stars, language, URL)

#### 2. Aggregation

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

#### 4. CORS fallback chain

If the direct GitHub API call fails, the fetcher retries automatically through two public proxies before surfacing an error.

---

## 🌍 Deploy to GitHub Pages

1. Set `base` in `vite.config.js` to match your repo name:

```js
base: "/github-dashboard/",
```

2. Add the workflow file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

3. In **Settings → Pages → Source** select **GitHub Actions**.

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## ⚠️ Known Limitations

- Only **public** data is fetched — private repos and contributions are not visible
- The GraphQL pinned-repos endpoint may return empty results without a personal access token due to rate limiting
- Adding `Authorization: Bearer <token>` to the headers in `ghFetch.js` raises the limit from 60 to 5 000 requests/hour

---

_This is an unofficial tool. GitHub is a trademark of GitHub, Inc._
