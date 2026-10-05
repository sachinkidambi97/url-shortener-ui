'use client';

import { useAuth } from '@/lib/auth-context';
import BackendSwitcher from './BackendSwitcher';
import { Button } from '@/components/ui/button';
import { LogOut, Link2 } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Link2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Shortr</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <BackendSwitcher />

            {user && (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-border/40 bg-card/50 px-3 py-1 text-sm sm:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
