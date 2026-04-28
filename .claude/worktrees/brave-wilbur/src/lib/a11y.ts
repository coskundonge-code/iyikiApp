import React, { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Screen reader only styles
 * Visually hides content while keeping it accessible to screen readers
 */
export const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
};

/**
 * Get props for skip to main content link
 * Should be placed at the very beginning of your layout
 */
export function getSkipLinkProps() {
  return {
    href: '#main-content',
    style: {
      ...srOnly,
      position: 'fixed' as const,
      top: 0,
      left: 0,
      zIndex: 9999,
      padding: '1rem',
      backgroundColor: '#000',
      color: '#fff',
      textDecoration: 'none',
      '&:focus': {
        clip: 'auto',
        width: 'auto',
        height: 'auto',
        overflow: 'visible',
      },
    },
  };
}

/**
 * Announce messages to screen readers
 * Uses aria-live region for dynamic content updates
 */
const announcerElement =
  typeof document !== 'undefined'
    ? (() => {
        let el = document.getElementById('announcer');
        if (!el) {
          el = document.createElement('div');
          el.id = 'announcer';
          el.setAttribute('aria-live', 'polite');
          el.setAttribute('aria-atomic', 'true');
          Object.assign(el.style, srOnly);
          if (document.body) {
            document.body.appendChild(el);
          }
        }
        return el;
      })()
    : null;

export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  if (!announcerElement) return;

  announcerElement.setAttribute('aria-live', politeness);
  announcerElement.textContent = message;

  // Clear after announcement to allow same message to be read again
  setTimeout(() => {
    announcerElement.textContent = '';
  }, 1000);
}

/**
 * Focus trap hook for modals and other overlay components
 * Keeps keyboard focus within the element when tab is pressed
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstElement.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref]);
}

/**
 * Hook for keyboard navigation through a list of items
 * Supports arrow keys and Enter/Space to select
 */
export function useKeyboardNavigation(
  items: string[],
  onSelect: (index: number) => void,
  onClose?: () => void
) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect(selectedIndex);
          break;
        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
        default:
          break;
      }
    },
    [items.length, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { selectedIndex, setSelectedIndex };
}

/**
 * Check if colors meet WCAG 2.1 contrast ratio requirements
 * AA: 4.5:1 for normal text, 3:1 for large text
 * AAA: 7:1 for normal text, 4.5:1 for large text
 */
export function meetsContrastRatio(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const parseColor = (color: string): [number, number, number] | null => {
    // Handle hex colors
    const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hexMatch) {
      return [
        parseInt(hexMatch[1], 16),
        parseInt(hexMatch[2], 16),
        parseInt(hexMatch[3], 16),
      ];
    }

    // Handle rgb colors
    const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }

    // Handle named colors (basic set)
    const namedColors: Record<string, [number, number, number]> = {
      black: [0, 0, 0],
      white: [255, 255, 255],
      red: [255, 0, 0],
      green: [0, 128, 0],
      blue: [0, 0, 255],
      yellow: [255, 255, 0],
      cyan: [0, 255, 255],
      magenta: [255, 0, 255],
    };

    return namedColors[color.toLowerCase()] || null;
  };

  const getLuminance = (rgb: [number, number, number]): number => {
    const [r, g, b] = rgb.map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const fgColor = parseColor(foreground);
  const bgColor = parseColor(background);

  if (!fgColor || !bgColor) {
    console.warn('Invalid color format');
    return false;
  }

  const l1 = getLuminance(fgColor);
  const l2 = getLuminance(bgColor);

  const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return level === 'AAA' ? contrast >= 7 : contrast >= 4.5;
}