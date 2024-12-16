import { useCallback, useEffect, useState } from 'react';
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'hcs-7-toolkit-storage';
const DB_VERSION = 2;

export function useIDBStorage<T>(key: string, initialValue: T, storeName: string) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<IDBPDatabase | null>(null);

  // Initialize DB only once when the hook mounts
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB(DB_NAME, DB_VERSION, {
          upgrade(db) {
            // Create the object store if it doesn't exist
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName);
            }
          },
        });
        setDb(database);
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
      }
    };

    initDB();
    return () => {
      db?.close();
    };
  }, [storeName]);

  // Load the initial value
  useEffect(() => {
    const loadInitialValue = async () => {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        const value = await db.get(storeName, key);
        if (value !== undefined) {
          setStoredValue(value);
        }
      } catch (error) {
        console.error('Error loading from IndexedDB:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialValue();
  }, [db, storeName, key]);

  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      if (!db) return false;

      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        await db.put(storeName, valueToStore, key);
        setStoredValue(valueToStore);
        return true;
      } catch (error) {
        console.error('Error saving to IndexedDB:', error);
        return false;
      }
    },
    [key, db, storeName]  // Remove storedValue from deps since we access it in closure
  );

  const removeValue = useCallback(async () => {
    if (!db) return false;

    try {
      await db.delete(storeName, key);
      setStoredValue(initialValue);
      return true;
    } catch (error) {
      console.error('Error removing from IndexedDB:', error);
      return false;
    }
  }, [key, initialValue, db, storeName]);

  return [storedValue, setValue, removeValue, loading] as const;
}
