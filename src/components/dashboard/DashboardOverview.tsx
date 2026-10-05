'use client';

import { UrlEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, MousePointerClick, TrendingUp, Activity } from 'lucide-react';

interface DashboardOverviewProps {
  urls: UrlEntry[];
}

export default function DashboardOverview({ urls }: DashboardOverviewProps) {
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, u) => sum + (u.clickCount ?? 0), 0);
  const topUrls = [...urls].sort((a, b) => (b.clickCount ?? 0) - (a.clickCount ?? 0)).slice(0, 5);

  const recentUrls = [...urls]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  function truncate(str: string, max: number) {
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Links</p>
                <p className="mt-1 text-3xl font-bold">{totalUrls}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Link2 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="mt-1 text-3xl font-bold">{totalClicks.toLocaleString()}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <MousePointerClick className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Clicks/Link</p>
                <p className="mt-1 text-3xl font-bold">
                  {totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : '0'}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Links</p>
                <p className="mt-1 text-3xl font-bold">
                  {urls.filter((u) => !u.expiresAt || new Date(u.expiresAt) > new Date()).length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Activity className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Most popular URLs */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Most Popular
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topUrls.length === 0 ? (
              <p className="text-sm text-muted-foreground">No links yet</p>
            ) : (
              <div className="space-y-3">
                {topUrls.map((entry, i) => (
                  <div key={entry.shortCode} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium font-mono text-primary">
                        {entry.shortCode}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {truncate(entry.originalUrl, 50)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">{(entry.clickCount ?? 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentUrls.length === 0 ? (
              <p className="text-sm text-muted-foreground">No links yet</p>
            ) : (
              <div className="space-y-3">
                {recentUrls.map((entry) => (
                  <div key={entry.shortCode} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Link2 className="h-3 w-3 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium font-mono text-primary">
                        {entry.shortCode}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {truncate(entry.originalUrl, 50)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
