import React from 'react';
import { useTheme } from './ThemeProvider.jsx';

/**
 * Admin app — flat background only (no mesh gradients).
 */
export default function MeshBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="pp-mesh"
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: isDark ? 'var(--pp-bg)' : 'var(--pp-bg)',
      }}
    />
  );
}
