import { useEffect, useState } from 'react';
import defaultTheme from '../theme.json';

export function useTheme(customTheme = null) {
  const [theme, setTheme] = useState(customTheme || defaultTheme);

  useEffect(() => {
    // Apply theme colors as CSS variables on root element
    const root = document.documentElement;

    // Apply color variables
    Object.entries(theme.colors || {}).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply shape variables
    if (theme.shapes) {
      root.style.setProperty('--border-radius', `${theme.shapes.borderRadius}px`);
      root.style.setProperty('--border-width', `${theme.shapes.borderWidth}px`);
      root.style.setProperty('--shadow-small', theme.shapes.shadowSmall);
      root.style.setProperty('--shadow-large', theme.shapes.shadowLarge);
    }
  }, [theme]);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return {
    theme,
    updateTheme,
    colors: theme.colors || {},
    shapes: theme.shapes || {},
  };
}
