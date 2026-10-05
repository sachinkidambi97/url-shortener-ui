import { Backend, ShortenRequest, ShortenResponse, UrlEntry, StatsResponse, AuthResponse, RawStatsResponse } from '@/types';

const ENDPOINTS = {
  monolith: {
    auth: 'http://localhost:8080',
    shorten: 'http://localhost:8080',
    redirect: 'http://localhost:8080',
    stats: 'http://localhost:8080',
  },
  microservices: {
    auth: 'http://localhost:8081',
    shorten: 'http://localhost:8081',
    redirect: 'http://localhost:8082',
    stats: 'http://localhost:8083',
  },
};

function getBackend(): Backend {
  if (typeof window === 'undefined') return 'monolith';
  const stored = localStorage.getItem('backend') as Backend | null;
  return stored === 'microservices' ? 'microservices' : 'monolith';
}

function getBaseUrl(service: 'auth' | 'shorten' | 'redirect' | 'stats'): string {
  const backend = getBackend();
  return ENDPOINTS[backend][service];
}

export function getRedirectBaseUrl(): string {
  return getBaseUrl('redirect');
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.detail || body.message || body.error || body.title || message;
    } catch {
      // ignore parse errors
    }
    const err = new Error(message) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${getBaseUrl('auth')}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${getBaseUrl('auth')}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function shortenUrl(data: ShortenRequest): Promise<ShortenResponse> {
  const res = await fetch(`${getBaseUrl('shorten')}/api/shorten`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ShortenResponse>(res);
  result.shortUrl = `${getBaseUrl('redirect')}/${result.shortCode}`;
  return result;
}

export async function getUrls(): Promise<UrlEntry[]> {
  const res = await fetch(`${getBaseUrl('shorten')}/api/urls`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const entries = await handleResponse<UrlEntry[]>(res);
  const redirectBase = getBaseUrl('redirect');

  const enriched = await Promise.all(
    entries.map(async (e) => {
      let clickCount = 0;
      try {
        const stats = await getStats(e.shortCode);
        clickCount = stats.totalClicks;
      } catch {
        // stats service might be down — show 0
      }
      return { ...e, shortUrl: `${redirectBase}/${e.shortCode}`, clickCount };
    })
  );
  return enriched;
}

export async function updateUrl(code: string, originalUrl: string): Promise<UrlEntry> {
  const res = await fetch(`${getBaseUrl('shorten')}/api/urls/${code}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ url: originalUrl }),
  });
  return handleResponse<UrlEntry>(res);
}

export async function deleteUrl(code: string): Promise<void> {
  const res = await fetch(`${getBaseUrl('shorten')}/api/urls/${code}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // ignore
    }
    const err = new Error(message) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
}

export async function getStats(code: string): Promise<StatsResponse> {
  const res = await fetch(`${getBaseUrl('stats')}/api/stats/${code}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const raw = await handleResponse<RawStatsResponse>(res);

  const rawClicks = raw.recentClicks || raw.clicks || [];
  const recentClicks = rawClicks.map(c => ({
    timestamp: c.clickedAt,
    ip: c.ipAddress,
    userAgent: c.userAgent,
    referrer: c.referrer,
  }));

  const clicksByDayMap: Record<string, number> = {};
  for (const c of rawClicks) {
    const day = c.clickedAt.slice(0, 10);
    clicksByDayMap[day] = (clicksByDayMap[day] || 0) + 1;
  }
  const clicksByDay = Object.entries(clicksByDayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, clicks]) => ({ date, clicks }));

  return {
    shortCode: raw.shortCode,
    originalUrl: raw.originalUrl,
    totalClicks: raw.totalClicks,
    clicksByDay,
    recentClicks,
  };
}
