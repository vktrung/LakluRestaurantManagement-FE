'use client';

import React, { useState, useEffect } from 'react';
import { MoonIcon } from './MoonIcon';
import { SunIcon } from './SunIcon';

const ThemeSwitch: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  // Khởi tạo theme từ localStorage hoặc prefers-color-scheme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    setIsMounted(true);
  }, []);

  // Cập nhật lớp dark trên html và lưu vào localStorage khi theme thay đổi
  useEffect(() => {
    if (!isMounted) return;

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', theme);
  }, [theme, isMounted]);

  // Hàm toggle theme
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={toggleTheme}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 shadow-sm ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}
        aria-label="Toggle Theme"
      >
        <span
          className={`inline-block w-3/5 h-full transform bg-white rounded-full transition-transform duration-300 shadow-sm ${
            theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
        <span
          className={`absolute left-1 text-yellow-500 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <SunIcon />
        </span>
        <span
          className={`absolute right-1 text-gray-800 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <MoonIcon />
        </span>
      </button>
    </div>
  );
};

export default ThemeSwitch;
