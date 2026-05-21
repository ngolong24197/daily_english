import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { colors, type ThemeColors, typography, spacing, radii } from '@/constants/theme';

interface Theme {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<Theme>({
  colors: colors.light,
  typography,
  spacing,
  radii,
  colorScheme: 'light',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const colorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const resolvedColors = colorScheme === 'dark' ? colors.dark : colors.light;

  const theme: Theme = {
    colors: resolvedColors,
    typography,
    spacing,
    radii,
    colorScheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}