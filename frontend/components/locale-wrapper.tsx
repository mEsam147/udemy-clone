"use client"

import type React from "react"

import { useEffect } from "react"

interface LocaleWrapperProps {
  locale: string
  children: React.ReactNode
}

export function LocaleWrapper({ locale, children }: LocaleWrapperProps) {
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"

    // Update body class for font
    document.body.classList.remove("font-cairo", "font-inter")
    document.body.classList.add(locale === "ar" ? "font-cairo" : "font-inter")
  }, [locale])

  return <>{children}</>
}
