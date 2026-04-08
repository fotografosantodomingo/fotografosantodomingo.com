'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true) // default dark

  useEffect(() => {
    // Sync with current class state (set by the FOUC-prevention script)
    setIsDark(!document.documentElement.classList.contains('light-mode'))
  }, [])

  const toggle = () => {
    const html = document.documentElement

    // Add transitioning attribute so CSS can apply smooth transitions
    // only during the switch (avoids messing with hover transitions)
    html.setAttribute('data-theme-transitioning', '')
    const cleanup = setTimeout(() => html.removeAttribute('data-theme-transitioning'), 350)

    if (html.classList.contains('light-mode')) {
      html.classList.remove('light-mode')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    } else {
      html.classList.add('light-mode')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    }

    return () => clearTimeout(cleanup)
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center gap-2 group"
    >
      {/* Sun / Moon icon */}
      <span className="text-gray-400 group-hover:text-white transition-colors">
        {isDark ? (
          // Moon
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          // Sun
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </span>

      {/* Sliding pill toggle */}
      <div
        className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
          isDark ? 'bg-gray-700' : 'bg-sky-500'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            isDark ? 'translate-x-0' : 'translate-x-5'
          }`}
        />
      </div>
    </button>
  )
}
