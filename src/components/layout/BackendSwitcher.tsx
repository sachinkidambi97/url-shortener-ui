'use client';

import { useBackend } from '@/lib/backend-context';
import { Backend } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Server, Network } from 'lucide-react';

export default function BackendSwitcher() {
  const { backend, setBackend } = useBackend();

  const options: { value: Backend; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'monolith',
      label: 'Monolith',
      icon: <Server className="h-4 w-4" />,
      description: 'localhost:8080',
    },
    {
      value: 'microservices',
      label: 'Microservices',
      icon: <Network className="h-4 w-4" />,
      description: '8081 / 8082 / 8083',
    },
  ];

  const current = options.find((o) => o.value === backend)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 border-border/60 bg-card/50 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {current.icon}
          <span className="hidden sm:inline">{current.label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            className="flex items-start gap-3 py-3 cursor-pointer"
            onClick={() => setBackend(opt.value)}
          >
            <div className="mt-0.5 text-muted-foreground">{opt.icon}</div>
            <div className="flex flex-col">
              <span className="font-medium">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.description}</span>
            </div>
            {backend === opt.value && (
              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
