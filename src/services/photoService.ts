import { newId } from '@/utils/ids';

const DB_NAME = 'hogar-fotos';
const STORE_NAME = 'fotos';

interface StoredPhoto {
  id: string;
  blob: Blob;
  createdAt: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }
  return dbPromise;
}

function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  return openDatabase().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const request = run(tx.objectStore(STORE_NAME));
        let result: T | undefined;
        if (request) {
          request.onsuccess = () => {
            result = request.result;
          };
        }
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }),
  );
}

/** Guarda las fotos comprimidas en IndexedDB; los gastos solo guardan sus ids. */
export const photoService = {
  async save(blob: Blob): Promise<string> {
    const photo: StoredPhoto = { id: newId(), blob, createdAt: new Date().toISOString() };
    await withStore('readwrite', (store) => store.put(photo));
    return photo.id;
  },

  async getBlob(id: string): Promise<Blob | null> {
    const photo = await withStore<StoredPhoto>('readonly', (store) => store.get(id));
    return photo?.blob ?? null;
  },

  async remove(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await withStore('readwrite', (store) => {
      ids.forEach((id) => store.delete(id));
    });
  },

  async clearAll(): Promise<void> {
    await withStore('readwrite', (store) => store.clear());
  },
};
