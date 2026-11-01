import type { AppData, MemberId } from '@/types';
import { supabase } from '@/lib/supabase';

const HOUSEHOLD_ID = 'hogar';
const LEGACY_STORAGE_KEY = 'hogar.datos.v1';

function withDefaults(data: AppData): AppData {
  return {
    ...data,
    products: data.products ?? [],
    purchases: data.purchases ?? [],
    shoppingList: data.shoppingList ?? [],
  };
}

/** Copia guardada en este navegador antes de usar la base de datos; se usa solo para migrar. */
function readLegacyCopy(): AppData | null {
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return null;
  try {
    return withDefaults(JSON.parse(raw) as AppData);
  } catch {
    return null;
  }
}

/** Carga y guarda los datos del hogar en Supabase. Los errores se lanzan para que la app los muestre. */
export const storageService = {
  async loadMember(userId: string): Promise<MemberId | null> {
    const { data, error } = await supabase
      .from('household_members')
      .select('member_id')
      .eq('user_id', userId)
      .eq('household_id', HOUSEHOLD_ID)
      .maybeSingle();
    if (error) throw error;
    return (data?.member_id as MemberId | undefined) ?? null;
  },

  async load(): Promise<AppData | null> {
    const { data, error } = await supabase
      .from('household_data')
      .select('data')
      .eq('id', HOUSEHOLD_ID)
      .maybeSingle();
    if (error) throw error;
    if (data) return withDefaults(data.data as AppData);
    return readLegacyCopy();
  },

  async save(data: AppData): Promise<void> {
    const { error } = await supabase
      .from('household_data')
      .upsert({ id: HOUSEHOLD_ID, data, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  async clear(): Promise<void> {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  },
};
