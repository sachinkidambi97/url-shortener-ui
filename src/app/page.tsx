'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getUrls } from '@/lib/api';
import { UrlEntry } from '@/types';
import AuthForm from '@/components/auth/AuthForm';
import ShortenForm from '@/components/dashboard/ShortenForm';
import UrlTable from '@/components/dashboard/UrlTable';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import StatsPanel from '@/components/dashboard/StatsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LayoutDashboard, Link2, BarChart2 } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [urls, setUrls] = useState<UrlEntry[]>([]);
  const [urlsLoading, setUrlsLoading] = useState(false);
  const [urlsError, setUrlsError] = useState('');
  const [statsCode, setStatsCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchUrls = useCallback(async () => {
    if (!user) return;
    setUrlsLoading(true);
    setUrlsError('');
    try {
      const data = await getUrls();
      setUrls(data);
    } catch (err: unknown) {
      setUrlsError(err instanceof Error ? err.message : 'Failed to load URLs');
    } finally {
      setUrlsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleViewStats = (code: string) => {
    setStatsCode(code);
    setActiveTab('stats');
  };

  const handleBackFromStats = () => {
    setStatsCode(null);
    setActiveTab('links');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your short links and track performance
        </p>
      </div>

      {/* Shorten form is always visible at top */}
      <div className="mb-8">
        <ShortenForm onShortened={fetchUrls} />
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-1.5">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="links" className="gap-1.5">
            <Link2 className="h-4 w-4" />
            My Links
          </TabsTrigger>
          {statsCode && (
            <TabsTrigger value="stats" className="gap-1.5">
              <BarChart2 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          {urlsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : urlsError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {urlsError}
            </div>
          ) : (
            <DashboardOverview urls={urls} />
          )}
        </TabsContent>

        <TabsContent value="links" className="mt-0">
          {urlsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : urlsError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {urlsError}
            </div>
          ) : (
            <UrlTable
              urls={urls}
              onRefresh={fetchUrls}
              onViewStats={handleViewStats}
            />
          )}
        </TabsContent>

        {statsCode && (
          <TabsContent value="stats" className="mt-0">
            <StatsPanel shortCode={statsCode} onBack={handleBackFromStats} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
