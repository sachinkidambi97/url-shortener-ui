'use client';

import { useState } from 'react';
import { UrlEntry } from '@/types';
import { deleteUrl, updateUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Copy,
  Check,
  BarChart2,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  Link,
} from 'lucide-react';

interface UrlTableProps {
  urls: UrlEntry[];
  onRefresh: () => void;
  onViewStats: (code: string) => void;
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function UrlTable({ urls, onRefresh, onViewStats }: UrlTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<UrlEntry | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteEntry, setDeleteEntry] = useState<UrlEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleCopy = async (url: string, code: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openEdit = (entry: UrlEntry) => {
    setEditEntry(entry);
    setEditUrl(entry.originalUrl);
    setEditError('');
  };

  const handleEdit = async () => {
    if (!editEntry) return;
    setEditError('');
    setEditLoading(true);
    try {
      await updateUrl(editEntry.shortCode, editUrl);
      setEditEntry(null);
      onRefresh();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update URL');
    } finally {
      setEditLoading(false);
    }
  };

  const openDelete = (entry: UrlEntry) => {
    setDeleteEntry(entry);
  };

  const handleDelete = async () => {
    if (!deleteEntry) return;
    setDeleteLoading(true);
    try {
      await deleteUrl(deleteEntry.shortCode);
      setDeleteEntry(null);
      onRefresh();
    } catch (err: unknown) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (urls.length === 0) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Link className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No links yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Shorten your first URL above to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>My Links</span>
            <Badge variant="secondary">{urls.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="w-28">Code</TableHead>
                  <TableHead>Original URL</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="hidden md:table-cell">Expires</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Clicks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urls.map((entry) => (
                  <TableRow key={entry.shortCode} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="font-mono text-sm font-medium text-primary">
                      <div className="flex items-center gap-1">
                        {entry.shortCode}
                        {isExpired(entry.expiresAt) && (
                          <Badge variant="destructive" className="text-[10px] h-4 px-1">expired</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 max-w-xs">
                        <span className="text-sm text-muted-foreground truncate" title={entry.originalUrl}>
                          {truncate(entry.originalUrl, 50)}
                        </span>
                        <a
                          href={entry.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-muted-foreground/60 hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {entry.expiresAt ? formatDate(entry.expiresAt) : '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-right text-sm font-medium">
                      {entry.clickCount ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Copy short URL"
                          onClick={() => handleCopy(entry.shortUrl, entry.shortCode)}
                        >
                          {copiedCode === entry.shortCode ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="View stats"
                          onClick={() => onViewStats(entry.shortCode)}
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Edit"
                          onClick={() => openEdit(entry)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive/70 hover:text-destructive"
                          title="Delete"
                          onClick={() => openDelete(entry)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editEntry} onOpenChange={(open) => !open && setEditEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Destination URL</DialogTitle>
            <DialogDescription>
              Update the destination URL for{' '}
              <code className="rounded bg-muted px-1 text-sm font-mono">
                {editEntry?.shortCode}
              </code>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-url">New destination URL</Label>
              <Input
                id="edit-url"
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://new-destination.com"
                className="font-mono text-sm"
              />
            </div>
            {editError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {editError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={editLoading}>
              {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteEntry} onOpenChange={(open) => !open && setDeleteEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Short Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <code className="rounded bg-muted px-1 text-sm font-mono">
                {deleteEntry?.shortCode}
              </code>
              ? This action cannot be undone. Anyone using this link will get a 404.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEntry(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
