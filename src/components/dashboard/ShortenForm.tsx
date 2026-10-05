'use client';

import { useState } from 'react';
import { shortenUrl } from '@/lib/api';
import { ShortenResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Link2, Copy, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface ShortenFormProps {
  onShortened?: () => void;
}

export default function ShortenForm({ onShortened }: ShortenFormProps) {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    setLoading(true);
    try {
      const data = await shortenUrl({
        url: normalizedUrl,
        alias: alias.trim() || undefined,
        expiresAt: expiresAt || undefined,
      });
      setResult(data);
      setUrl('');
      setAlias('');
      setExpiresAt('');
      onShortened?.();
    } catch (err: unknown) {
      const errWithStatus = err as Error & { status?: number };
      if (errWithStatus.status === 409) {
        setError('That alias is already taken. Please choose another.');
      } else if (errWithStatus.status === 400) {
        setError(err instanceof Error ? err.message : 'Invalid request. Please check your inputs.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to shorten URL');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.shortUrl) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-primary" />
          Shorten a URL
        </CardTitle>
        <CardDescription>Paste your long URL and get a short link instantly</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/very/long/url..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={loading} className="shrink-0">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Shorten'
              )}
            </Button>
          </div>

          {/* Advanced options toggle */}
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Advanced options
          </button>

          {showAdvanced && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="alias" className="text-xs">Custom Alias (optional)</Label>
                <Input
                  id="alias"
                  placeholder="my-link"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expires" className="text-xs">Expires At (optional)</Label>
                <Input
                  id="expires"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="mb-2 text-sm font-medium text-emerald-400">Link created successfully!</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded border border-border/40 bg-background/50 px-2 py-1 text-sm font-mono">
                  {result.shortUrl}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0 gap-1.5"
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copy</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                  className="shrink-0"
                >
                  <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
