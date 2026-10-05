export type Backend = 'monolith' | 'microservices';

export interface User {
  email: string;
  token: string;
}

export interface AuthResponse {
  token: string;
  email: string;
}

export interface ShortenRequest {
  url: string;
  alias?: string;
  expiresAt?: string;
}

export interface ShortenResponse {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  alias?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface UrlEntry {
  shortCode: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  expiresAt?: string;
  clickCount: number;
}

export interface ClickEvent {
  timestamp: string;
  ip: string;
  userAgent: string;
  referrer: string;
}

export interface ClickByDay {
  date: string;
  clicks: number;
}

export interface StatsResponse {
  shortCode: string;
  originalUrl: string;
  totalClicks: number;
  clicksByDay: ClickByDay[];
  recentClicks: ClickEvent[];
}

export interface ApiError {
  message: string;
  status: number;
}
