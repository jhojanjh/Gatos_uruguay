import { createTheme, type MantineColorsTuple } from '@mantine/core';

const terracota: MantineColorsTuple = [
  '#fdf6f1',
  '#fbe9de',
  '#f6d3bd',
  '#efb596',
  '#e5916b',
  '#d9764b',
  '#b65b31',
  '#9a4a27',
  '#7d3b21',
  '#5e2c18',
];

const salvia: MantineColorsTuple = [
  '#f3f8f4',
  '#e3efe6',
  '#c8dfcd',
  '#a6cbb0',
  '#84b393',
  '#669c78',
  '#4f8061',
  '#3e6a4f',
  '#2f5239',
  '#203a28',
];

export const theme = createTheme({
  primaryColor: 'terracota',
  colors: { terracota, salvia },
  fontFamily: 'Nunito, system-ui, -apple-system, sans-serif',
  headings: { fontFamily: 'Nunito, system-ui, -apple-system, sans-serif', fontWeight: '800' },
  defaultRadius: 'lg',
  components: {
    Button: { defaultProps: { size: 'lg', radius: 'xl' } },
    ActionIcon: { defaultProps: { size: 'xl', variant: 'subtle', radius: 'xl' } },
    Modal: { defaultProps: { radius: 'xl', centered: true, overlayProps: { backgroundOpacity: 0.4, blur: 3 } } },
  },
});
