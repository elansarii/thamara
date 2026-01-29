'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getDatabase } from '@/lib/database';
import { initExchangeStorage } from '@/lib/exchangeStorage';

interface DatabaseContextType {
  isReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isReady: false,
  error: null,
});

export function useDatabaseStatus() {
  return useContext(DatabaseContext);
}

interface DatabaseProviderProps {
  children: ReactNode;
}

export default function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initializeDatabase() {
      try {
        // Initialize the SQLite database
        await getDatabase();

        // Initialize storage modules
        await initExchangeStorage();

        setIsReady(true);
        console.log('Database initialized successfully');
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err instanceof Error ? err : new Error('Database initialization failed'));
        // Still set ready to allow app to work with fallback data
        setIsReady(true);
      }
    }

    initializeDatabase();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}
