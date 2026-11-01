import type { MemberId } from '@/types';

export interface Member {
  id: MemberId;
  name: string;
  color: string;
}

export const MEMBERS: Record<MemberId, Member> = {
  jhojan: { id: 'jhojan', name: 'Jhojan', color: 'salvia' },
  luisa: { id: 'luisa', name: 'Luisa', color: 'terracota' },
};

export const MEMBER_LIST: Member[] = [MEMBERS.jhojan, MEMBERS.luisa];

export const CATEGORY_COLORS = ['terracota', 'salvia', 'blue', 'yellow', 'cyan', 'pink', 'orange', 'teal', 'gray'];

export const CURRENCY_OPTIONS = [
  { value: 'UYU', label: 'Peso uruguayo (UYU)' },
  { value: 'USD', label: 'Dólar estadounidense (USD)' },
  { value: 'ARS', label: 'Peso argentino (ARS)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'BRL', label: 'Real brasileño (BRL)' },
];

export const DEFAULT_CURRENCY = 'UYU';
export const MAX_PHOTOS_PER_EXPENSE = 4;
export const BUDGET_WARNING_RATIO = 0.8;
