'use client';

import { useEffect, useState } from 'react';
import { getStats } from '@/lib/api';
import { StatsResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, MousePointerClick, Loader2, AlertCircle, Clock, RefreshCw } from 'lucide-react';

interface StatsPanelProps {
  shortCode: string;
  onBack: () => void;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export default function StatsPanel({ shortCode, onBack }: StatsPanelProps) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    getStats(shortCode)
      .then(setStats)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(true), 10000);
    return () => clearInterval(interval);
  }, [shortCode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">
            Analytics:{' '}
            <code className="rounded bg-muted px-2 py-0.5 text-base font-mono">{shortCode}</code>
          </h2>
          {stats?.originalUrl && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {truncate(stats.originalUrl, 80)}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchStats(true)} disabled={refreshing} className="gap-1.5">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {stats && !loading && (
        <>
          {/* Total clicks metric */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <MousePointerClick className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-4xl font-bold tracking-tight">
                    {stats.totalClicks.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Click timeline chart */}
          {stats.clicksByDay && stats.clicksByDay.length > 0 && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Click Timeline</CardTitle>
                <CardDescription>Clicks per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={stats.clicksByDay} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent clicks table */}
          {stats.recentClicks && stats.recentClicks.length > 0 && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Recent Clicks
                </CardTitle>
                <CardDescription>Last {stats.recentClicks.length} visits</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40 hover:bg-transparent">
                        <TableHead>Time</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead className="hidden md:table-cell">Referrer</TableHead>
                        <TableHead className="hidden lg:table-cell">User Agent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentClicks.map((click, i) => (
                        <TableRow key={i} className="border-border/30 hover:bg-muted/30">
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            <span title={new Date(click.timestamp).toLocaleString()}>
                              {timeAgo(click.timestamp)}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{click.ip || '—'}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {click.referrer ? truncate(click.referrer, 40) : '—'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                            {click.userAgent ? truncate(click.userAgent, 60) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.recentClicks && stats.recentClicks.length === 0 && (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <MousePointerClick className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">No clicks recorded yet</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
