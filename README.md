# Shortr — URL Shortener Dashboard

A polished, dark-themed dashboard UI for managing short links, built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- **Backend Switcher** — Toggle between Monolith and Microservices backends; persists in localStorage
- **Auth** — Login / Register with JWT token storage; logged-in user email shown in header
- **URL Shortener Form** — Shorten a URL, optional alias and expiration date
- **My Links Table** — View, copy, edit, and delete your short links
- **Analytics Dashboard** — Per-URL click stats with a line chart and recent-clicks table
- **Dashboard Overview** — Total links, total clicks, avg clicks/link, top 5 URLs, recent activity

## Prerequisites

- Node.js 18+ (v20+ recommended)
- A running backend — either the monolith or all three microservices

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Backend Configuration

### Monolith mode (default)

All API calls route to **`http://localhost:8080`**.

Endpoints used:
| Verb | Path | Purpose |
|------|------|---------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login |
| POST | /api/shorten | Create a short URL |
| GET  | /api/urls | List the current user's URLs |
| PUT  | /api/urls/{code} | Update destination URL |
| DELETE | /api/urls/{code} | Delete a URL |
| GET  | /api/stats/{code} | Fetch click analytics |

### Microservices mode

Switch via the dropdown in the top-right corner.

| Service | Port | Handles |
|---------|------|---------|
| Shortening API | 8081 | Auth + URL CRUD |
| Redirect Service | 8082 | Redirect (browser follows; UI just shows the URL) |
| Analytics Service | 8083 | Stats (`GET /api/stats/{code}`) |

## CORS

Both the monolith and each microservice must allow CORS from the Next.js dev server.

Add the following origin to your CORS configuration:

```
http://localhost:3000
```

**Example (Go / net/http middleware):**
```go
w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
```

**Example (Spring Boot):**
```java
@CrossOrigin(origins = "http://localhost:3000")
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers (Auth, Backend)
│   ├── page.tsx            # Main dashboard page (tabs: Overview, My Links, Analytics)
│   └── globals.css         # Tailwind base styles + CSS variables (dark theme)
├── components/
│   ├── auth/
│   │   └── AuthForm.tsx    # Login / Register toggle form
│   ├── dashboard/
│   │   ├── DashboardOverview.tsx  # Summary cards + top URLs + recent activity
│   │   ├── UrlTable.tsx           # My URLs table with edit/delete/copy/stats actions
│   │   ├── ShortenForm.tsx        # URL shortener input with advanced options
│   │   └── StatsPanel.tsx         # Analytics view for a single URL (chart + table)
│   ├── layout/
│   │   ├── Header.tsx             # Top bar: logo, backend switcher, user email, logout
│   │   └── BackendSwitcher.tsx    # Monolith / Microservices dropdown
│   └── ui/                        # shadcn/ui components (Tailwind v3 / Radix UI)
├── lib/
│   ├── api.ts              # API client — routes calls to the correct backend
│   ├── auth-context.tsx    # Auth context (token, email, login, logout)
│   └── backend-context.tsx # Backend selection context (monolith vs microservices)
└── types/
    └── index.ts            # TypeScript interfaces
```

## UI Sections

1. **Header** — Logo ("Shortr"), animated green indicator + backend name, logged-in email pill, Logout button.
2. **Auth Screen** — Shown when not logged in. Tabbed Sign In / Register card with inline error messages.
3. **Shorten Form** — Always visible at top of dashboard. URL input, Shorten button, expandable advanced options (alias, expiry). Result shows the short URL with Copy and Open buttons.
4. **Overview Tab** — Four metric cards (Total Links, Total Clicks, Avg Clicks/Link, Active Links), Most Popular (ranked list), Recent Activity (latest created).
5. **My Links Tab** — Full table of short links with Short Code, Original URL (truncated + external link), Created At, Expires At, click count, and action buttons (Copy, Stats, Edit, Delete). Edit opens a modal; Delete requires confirmation.
6. **Analytics Tab** — Appears when "View Stats" is clicked. Shows total click count prominently, a responsive line chart (clicks per day via recharts), and a recent-clicks table (time, IP, referrer, user agent).

## Tech Stack

- [Next.js 14](https://nextjs.org/) — App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v3
- [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- [recharts](https://recharts.org/) — Click timeline chart
- [lucide-react](https://lucide.dev/) — Icons
