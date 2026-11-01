import { BarChart3, CalendarDays, Home, type LucideIcon, Receipt, ShoppingCart, Tags } from 'lucide-react';

export type ScreenId = 'inicio' | 'gastos' | 'semana' | 'compras' | 'precios' | 'resumen';

export const NAV_ITEMS: { id: ScreenId; label: string; icon: LucideIcon }[] = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'gastos', label: 'Gastos', icon: Receipt },
  { id: 'semana', label: 'Semana', icon: CalendarDays },
  { id: 'compras', label: 'Compras', icon: ShoppingCart },
  { id: 'precios', label: 'Precios', icon: Tags },
  { id: 'resumen', label: 'Resumen', icon: BarChart3 },
];
