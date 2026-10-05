import { Backend, ShortenRequest, ShortenResponse, UrlEntry, StatsResponse, AuthResponse } from '@/types';

const ENDPOINTS = {
  monolith: {
    auth: 'http://localhost:8080',
    shorten: 'http://localhost:8080',
    stats: 'http://localhost:8080',
  },
  microservices: {
    auth: 'http://localhost:8081',
    shorten: 'http://localhost:8081',
    stats: 'http://localhost:8083',
  },
};

function getBackend(): Backend {
  if (typeof window === 'undefined') return 'monolith';
  const stored = localStorage.getItem('backend') as Backend | null;
  return stored === 'microservices' ? 'microservices' : 'monolith';
}

function getBaseUrl(service: 'auth' | 'shorten' | 'stats'): string {
  const backend = getBackend();
  return ENDPOINTS[backend][service];
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
      message = body.message || body.error || message;
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
  return handleResponse<ShortenResponse>(res);
}

export async function getUrls(): Promise<UrlEntry[]> {
  const res = await fetch(`${getBaseUrl('shorten')}/api/urls`, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleResponse<UrlEntry[]>(res);
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
  return handleResponse<StatsResponse>(res);
}
