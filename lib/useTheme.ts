'use client'

import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setThemeState(isDark ? 'dark' : 'light')
  }, [])

  const setTheme = (t: Theme) => {
    if (t === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('fk-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('fk-theme', 'light')
    }
    setThemeState(t)
  }

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return { theme, setTheme, toggle }
}
