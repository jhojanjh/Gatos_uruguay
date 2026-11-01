import { createTheme, type MantineColorsTuple } from '@mantine/core';
import type { AccentColor } from '@/types';

const terracota: MantineColorsTuple = [
  '#fdf6f1', '#fbe9de', '#f6d3bd', '#efb596', '#e5916b',
  '#d9764b', '#b65b31', '#9a4a27', '#7d3b21', '#5e2c18',
];

const salvia: MantineColorsTuple = [
  '#f3f8f4', '#e3efe6', '#c8dfcd', '#a6cbb0', '#84b393',
  '#669c78', '#4f8061', '#3e6a4f', '#2f5239', '#203a28',
];

const azul: MantineColorsTuple = [
  '#f0f7ff', '#e0efff', '#c7e0ff', '#a0c9ff', '#75aefa',
  '#4d92f0', '#3175d3', '#285fac', '#204a85', '#19385f',
];

const verde: MantineColorsTuple = salvia;

const violeta: MantineColorsTuple = [
  '#f7f2ff', '#eee4ff', '#dfccff', '#c9a9ff', '#b184f5',
  '#9562df', '#7847c3', '#6239a3', '#4d2e80', '#39225e',
];

const palettes: Record<AccentColor, MantineColorsTuple> = { terracota, azul, verde, violeta };

export const ACCENT_COLOR_OPTIONS: { value: AccentColor; label: string; swatch: string }[] = [
  { value: 'terracota', label: 'Terracota', swatch: terracota[6] },
  { value: 'azul', label: 'Azul', swatch: azul[6] },
  { value: 'verde', label: 'Verde', swatch: verde[6] },
  { value: 'violeta', label: 'Violeta', swatch: violeta[6] },
];

const themeConfig = {
  primaryColor: 'terracota',
  colors: { terracota, salvia },
  fontFamily: 'Nunito, system-ui, -apple-system, sans-serif',
  headings: { fontFamily: 'Nunito, system-ui, -apple-system, sans-serif', fontWeight: '800' },
  defaultRadius: 'lg',
  components: {
    Button: { defaultProps: { size: 'lg', radius: 'xl' } },
    ActionIcon: { defaultProps: { size: 'xl', variant: 'subtle', radius: 'xl' } },
    Modal: { defaultProps: { radius: 'xl', centered: true, overlayProps: { backgroundOpacity: 0.4, blur: 3 } },
  },
};

export const theme = createTheme(themeConfig);

export function themeForAccent(accentColor: AccentColor) {
  return createTheme({
    ...themeConfig,
    colors: { ...themeConfig.colors, terracota: palettes[accentColor] },
  });
}
