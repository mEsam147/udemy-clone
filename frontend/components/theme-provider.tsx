// "use client"

// import * as React from "react"

// type Theme = "dark" | "light" | "system"

// type ThemeProviderProps = {
//   children: React.ReactNode
//   defaultTheme?: Theme
//   storageKey?: string
//   attribute?: string
//   enableSystem?: boolean
//   disableTransitionOnChange?: boolean
// }

// type ThemeProviderState = {
//   theme: Theme
//   setTheme: (theme: Theme) => void
// }

// const initialState: ThemeProviderState = {
//   theme: "system",
//   setTheme: () => null,
// }

// const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

// export function ThemeProvider({
//   children,
//   defaultTheme = "system",
//   storageKey = "vite-ui-theme",
//   attribute = "class",
//   enableSystem = true,
//   disableTransitionOnChange = false,
//   ...props
// }: ThemeProviderProps) {
//   const [theme, setThemeState] = React.useState<Theme>(() => {
//     if (typeof window === "undefined") return defaultTheme;
//     const storedTheme = localStorage.getItem(storageKey);
//     return (storedTheme as Theme) || defaultTheme;
//   });

//   const applyTheme = React.useCallback((newTheme: Theme) => {
//     const root = window.document.documentElement;
//     root.classList.remove("light", "dark");
//     let effectiveTheme = newTheme;
//     if (newTheme === "system" && enableSystem) {
//       effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
//     }
//     root.classList.add(effectiveTheme);
//   }, [enableSystem]);

//   React.useEffect(() => {
//     applyTheme(theme);
//   }, [theme, applyTheme]);

//   const handleMediaChange = React.useCallback((e: MediaQueryListEvent) => {
//     if (theme === "system" && enableSystem) {
//       applyTheme("system");
//     }
//   }, [theme, enableSystem, applyTheme]);

//   React.useEffect(() => {
//     if (theme === "system" && enableSystem) {
//       const media = window.matchMedia("(prefers-color-scheme: dark)");
//       media.addEventListener("change", handleMediaChange);
//       return () => media.removeEventListener("change", handleMediaChange);
//     }
//   }, [theme, enableSystem, handleMediaChange]);

//   const value = {
//     theme,
//     setTheme: (newTheme: Theme) => {
//       localStorage.setItem(storageKey, newTheme);
//       setThemeState(newTheme);
//     },
//   }

//   return (
//     <ThemeProviderContext.Provider {...props} value={value}>
//       {children}
//     </ThemeProviderContext.Provider>
//   )
// }

// export const useTheme = () => {
//   const context = React.useContext(ThemeProviderContext)
//   if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")
//   return context
// }



"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(
    () => {
      // Return default theme during SSR
      if (typeof window === "undefined") return defaultTheme
      
      // Get stored theme or default
      const storedTheme = localStorage.getItem(storageKey) as Theme
      return storedTheme || defaultTheme
    }
  )

  const applyTheme = React.useCallback((newTheme: Theme) => {
    const root = window.document.documentElement
    
    // Remove transitions if disabled
    if (disableTransitionOnChange) {
      root.classList.add('no-transitions')
      window.setTimeout(() => {
        root.classList.remove('no-transitions')
      }, 0)
    }

    root.classList.remove("light", "dark")
    
    let effectiveTheme = newTheme
    if (newTheme === "system" && enableSystem) {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    
    root.classList.add(effectiveTheme)
    root.setAttribute(attribute, effectiveTheme)
  }, [enableSystem, disableTransitionOnChange, attribute])

  // Apply theme on mount and theme change
  React.useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  // Handle system theme changes
  React.useEffect(() => {
    if (theme === "system" && enableSystem) {
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => applyTheme("system")
      
      media.addEventListener("change", handleChange)
      return () => media.removeEventListener("change", handleChange)
    }
  }, [theme, enableSystem, applyTheme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch (e) {
        console.warn('Failed to save theme to localStorage:', e)
      }
      setThemeState(newTheme)
    },
  }

  // Prevent flash by rendering a script that sets the theme before hydration
  const themeScript = React.useMemo(() => {
    if (typeof window === "undefined") {
      return `
        (function() {
          var theme = localStorage.getItem('${storageKey}') || '${defaultTheme}';
          var effectiveTheme = theme;
          if (theme === 'system') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          document.documentElement.classList.add(effectiveTheme);
          document.documentElement.setAttribute('${attribute}', effectiveTheme);
        })();
      `
    }
    return ''
  }, [storageKey, defaultTheme, attribute])

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <script
        dangerouslySetInnerHTML={{ __html: themeScript }}
        suppressHydrationWarning
      />
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)
  if (context === undefined) 
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
