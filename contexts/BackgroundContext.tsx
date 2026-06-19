import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ✅ Migrated from custom color-picker background to a clean Dark/Light theme switch
// for the Claymorphism design system. Keeps the same hook shape (useBackground)
// so existing components don't need prop-level rewrites.

interface BackgroundContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  isLightBackground: boolean;
  // Legacy-compatible fields, now mapped to clay tokens
  bgColor: string;
  textColor: string;
  grayColor: string;
  glassBg: string;
  glassBorder: string;
  glassHover: string;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

interface BackgroundProviderProps {
  children: ReactNode;
}

export const BackgroundProvider: React.FC<BackgroundProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('vionyx-theme') as 'light' | 'dark' | null;
    if (saved === 'light' || saved === 'dark') {
      setThemeState(saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setThemeState('light');
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vionyx-theme', theme);
  }, [theme]);

  const setTheme = (t: 'light' | 'dark') => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const isLightBackground = theme === 'light';

  // Legacy-compatible derived classes using clay tokens (CSS vars handle actual color)
  const textColor = 'text-[var(--foreground)]';
  const grayColor = 'text-[var(--foreground-muted)]';
  const glassBg = 'bg-[var(--surface)]';
  const glassBorder = 'border-[var(--border)]';
  const glassHover = 'hover:border-[var(--accent-border)]';
  const bgColor = isLightBackground ? '#F5F7FA' : '#0F1115';

  return (
    <BackgroundContext.Provider value={{
      theme,
      toggleTheme,
      setTheme,
      isLightBackground,
      bgColor,
      textColor,
      grayColor,
      glassBg,
      glassBorder,
      glassHover,
    }}>
      {children}
    </BackgroundContext.Provider>
  );
};
