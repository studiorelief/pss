import './transition.css';

import SwupHeadPlugin from '@swup/head-plugin';
import Swup from 'swup';

// Spatial page order: Chems (left) ← Home (center) → Sex (right)
const PAGE_ORDER: Record<string, number> = {
  '/': 0,
  '/chems': -1,
  '/sex': 1,
};

function getPagePosition(url: string): number {
  const path = new URL(url, window.location.origin).pathname.replace(/\/$/, '') || '/';
  return PAGE_ORDER[path] ?? 0;
}

export function initSwup(): Swup {
  const swup = new Swup({
    animationSelector: '[class*="transition-"]',
    containers: ['#swup'],
    plugins: [new SwupHeadPlugin({ persistAssets: true })],
  });

  // Set slide direction based on page spatial order
  swup.hooks.on('visit:start', (visit) => {
    const from = getPagePosition(visit.from.url);
    const to = getPagePosition(visit.to.url);

    if (to > from) {
      document.documentElement.classList.add('to-right');
    } else {
      document.documentElement.classList.add('to-left');
    }
  });

  swup.hooks.on('animation:out:end', () => {
    document.documentElement.classList.remove('to-left', 'to-right');
  });

  return swup;
}
