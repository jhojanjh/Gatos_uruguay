import type { AppData } from '@/types';

const STORAGE_KEY = 'hogar.datos.v1';

/**
 * Capa de datos de la aplicación. Hoy guarda en localStorage; para sincronizar
 * entre dispositivos basta con reemplazar estos métodos por llamadas a una API o Supabase.
 */
export const storageService = {
  async load(): Promise<AppData | null> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as AppData;
      return { ...parsed, products: parsed.products ?? [], purchases: parsed.purchases ?? [] };
    } catch {
      return null;
    }
  },

  async save(data: AppData): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },
};
