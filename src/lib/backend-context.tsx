'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Backend } from '@/types';

interface BackendContextValue {
  backend: Backend;
  setBackend: (backend: Backend) => void;
}

const BackendContext = createContext<BackendContextValue>({
  backend: 'monolith',
  setBackend: () => {},
});

export function BackendProvider({ children }: { children: React.ReactNode }) {
  const [backend, setBackendState] = useState<Backend>('monolith');

  useEffect(() => {
    const stored = localStorage.getItem('backend') as Backend | null;
    if (stored === 'monolith' || stored === 'microservices') {
      setBackendState(stored);
    }
  }, []);

  const setBackend = (b: Backend) => {
    setBackendState(b);
    localStorage.setItem('backend', b);
  };

  return (
    <BackendContext.Provider value={{ backend, setBackend }}>
      {children}
    </BackendContext.Provider>
  );
}

export function useBackend() {
  return useContext(BackendContext);
}
