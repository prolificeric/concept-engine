import { useEffect, useState } from 'react';

export const useTheme = (): 'dark' | 'light' => {
  const [isDark, setIsDark] = useState(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const changeHandler = () => {
      setIsDark(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', changeHandler);

    return () => {
      mediaQuery.removeEventListener('change', changeHandler);
    };
  }, []);

  return isDark ? 'dark' : 'light';
};
