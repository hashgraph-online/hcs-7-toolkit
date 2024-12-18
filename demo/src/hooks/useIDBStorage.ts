import { useCallback, useEffect, useState, useRef } from 'react';
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'hcs-7-toolkit-storage';
const DB_VERSION = 2;

type DBState<T> = {
  value: T;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: Error;
};

let dbInitPromise: Promise<IDBPDatabase> | null = null;

export const getDB = async (storeName: string): Promise<IDBPDatabase> => {
  if (!dbInitPromise) {
    dbInitPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
          console.log("[DEBUG] Created store:", { storeName });
        }
      },
    });
  }
  return dbInitPromise;
};

export function useIDBStorage<T>(key: string, initialValue: T, storeName: string) {
  const [state, setState] = useState<DBState<T>>({
    value: initialValue,
    status: 'idle',
  });

  useEffect(() => {
    const initDB = async () => {
      console.log("[DEBUG] Initializing IndexedDB:", { key, storeName });
      setState(prev => ({ ...prev, status: 'loading' }));
      
      try {
        const db = await getDB(storeName);
        const value = await db.get(storeName, key);
        console.log("[DEBUG] Initial value loaded:", { value, key });
        
        setState({
          value: value ?? initialValue,
          status: 'ready',
        });
      } catch (error) {
        console.error("[ERROR] Database initialization failed:", { error, key, storeName });
        setState({
          value: initialValue,
          status: 'error',
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      }
    };

    initDB();
  }, [storeName, key, initialValue]);

  const setValue = useCallback(
    async (valueOrUpdater: T | ((prev: T) => T)): Promise<boolean> => {
      console.log("[DEBUG] setValue called:", { 
        dbStatus: state.status,
        key,
        storeName
      });

      try {
        const db = await getDB(storeName);
        const currentValue = await db.get(storeName, key) as T;
        const newValue = valueOrUpdater instanceof Function 
          ? valueOrUpdater(currentValue ?? state.value)
          : valueOrUpdater;

        console.log("[DEBUG] Putting value in IndexedDB:", { 
          key,
          storeName,
          valueSize: JSON.stringify(newValue).length
        });

        await db.put(storeName, newValue, key);
        console.log("[DEBUG] Value successfully stored in IndexedDB");

        setState(prev => ({ ...prev, value: newValue, status: 'ready' }));
        return true;
      } catch (error) {
        console.error("[ERROR] Failed to store in IndexedDB:", { 
          error,
          key,
          storeName
        });
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Unknown error'),
        }));
        return false;
      }
    },
    [key, storeName, state.value]
  );

  const removeValue = useCallback(async (): Promise<boolean> => {
    try {
      const db = await getDB(storeName);
      await db.delete(storeName, key);
      setState(prev => ({ ...prev, value: initialValue }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }));
      return false;
    }
  }, [key, storeName, initialValue]);

  return [
    state.value,
    setValue,
    removeValue,
    state.status === 'loading',
  ] as const;
}
