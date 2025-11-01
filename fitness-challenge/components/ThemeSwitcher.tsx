'use client';

import { useState } from 'react';

const themes = [
  {
    id: 'red',
    name: 'Red',
    bgClass: 'bg-red-500',
  },
  {
    id: 'magenta',
    name: 'Magenta',
    bgClass: 'bg-pink-500',
  },
  {
    id: 'green',
    name: 'Green',
    bgClass: 'bg-green-500',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    bgClass: 'bg-yellow-400',
  },
];

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState('red');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="btn btn-sm btn-ghost"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme"
      >
        🎨
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 z-50 bg-base-100 shadow-2xl rounded-lg p-6 border-2 border-base-content">
          <div className="flex gap-8">
            {/* Left: Circle Grid */}
            <div className="border-2 border-base-content rounded-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setActiveTheme(theme.id);
                      setIsOpen(false);
                    }}
                    className={`w-20 h-20 rounded-full transition-all hover:scale-110 cursor-pointer ${
                      theme.bgClass
                    } ${
                      activeTheme === theme.id
                        ? 'ring-4 ring-offset-2 ring-base-content'
                        : ''
                    }`}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            {/* Right: Preview Card */}
            <div className="w-48 space-y-4">
              <div className="flex gap-1 h-6 rounded overflow-hidden border border-base-300">
                {themes.map((theme) => (
                  <div
                    key={`preview-${theme.id}`}
                    className={`flex-1 ${theme.bgClass}`}
                  />
                ))}
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-base-300 rounded w-full"></div>
                <div className="h-3 bg-base-300 rounded w-full"></div>
                <div className="h-3 bg-base-300 rounded w-3/4"></div>
                <div className="h-3 bg-base-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
