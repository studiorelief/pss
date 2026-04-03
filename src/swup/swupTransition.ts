import './transition.css';

import SwupGaPlugin from '@swup/ga-plugin';
import SwupHeadPlugin from '@swup/head-plugin';
import SwupPreloadPlugin from '@swup/preload-plugin';
import Swup from 'swup';

import { activateTabFromURL } from '$utils/tabDeepLink';

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
    animationSelector: false,
    containers: ['#swup'],
    linkSelector: 'a[href]:not(.w-tab-link)',
    plugins: [
      new SwupHeadPlugin({ persistAssets: true }),
      new SwupPreloadPlugin({ preloadVisibleLinks: { delay: 0, threshold: 0 } }),
      new SwupGaPlugin({ gaMeasurementId: 'G-8L709ZQ1JY' }),
    ],
  });

  // Preload all known pages immediately (dropdown links aren't "visible" to the observer)
  for (const path of Object.keys(PAGE_ORDER)) {
    if (path !== '/') void fetch(path);
  }

  let direction: 'left' | 'right' = 'right';
  let oldContentHTML = '';
  let newContentHTML = '';
  let savedScrollY = 0;

  swup.hooks.on('visit:start', (visit) => {
    const from = getPagePosition(visit.from.url);
    const to = getPagePosition(visit.to.url);
    direction = to > from ? 'right' : 'left';
  });

  // Snapshot old content + scroll position before Swup replaces it
  swup.hooks.before('content:replace', () => {
    const container = document.querySelector('#swup');
    if (container) oldContentHTML = container.innerHTML;
    savedScrollY = window.scrollY;
  });

  // Activate correct tab + snapshot new content before animation
  swup.hooks.on('content:replace', () => {
    activateTabFromURL();
    const container = document.querySelector('#swup');
    if (container) newContentHTML = container.innerHTML;
  });

  // Build carousel, animate, cleanup — all in one place, no race condition
  swup.hooks.replace('animation:in:await', () => {
    return new Promise<void>((resolve) => {
      const container = document.querySelector('#swup') as HTMLElement;
      if (!container || !oldContentHTML || !newContentHTML) {
        oldContentHTML = '';
        newContentHTML = '';
        resolve();
        return;
      }

      // Build carousel track
      container.style.overflow = 'hidden';

      const track = document.createElement('div');
      track.className = 'slide-track';

      const oldPanel = document.createElement('div');
      oldPanel.className = 'slide-panel';
      oldPanel.style.transform = `translateY(-${savedScrollY}px)`;
      oldPanel.innerHTML = oldContentHTML;

      const newPanel = document.createElement('div');
      newPanel.className = 'slide-panel';
      newPanel.innerHTML = newContentHTML;

      if (direction === 'right') {
        track.append(oldPanel, newPanel);
        track.style.transform = 'translateX(0)';
      } else {
        track.append(newPanel, oldPanel);
        track.style.transform = 'translateX(-50%)';
      }

      container.innerHTML = '';
      container.appendChild(track);
      window.scrollTo(0, 0);

      // Listen for the track's own transform transition end
      const onEnd = (e: TransitionEvent) => {
        if (e.target !== track || e.propertyName !== 'transform') return;
        track.removeEventListener('transitionend', onEnd);

        const finalPanel = direction === 'right' ? track.lastElementChild : track.firstElementChild;
        if (finalPanel) container.innerHTML = finalPanel.innerHTML;
        container.style.overflow = '';
        oldContentHTML = '';
        newContentHTML = '';
        resolve();
      };
      track.addEventListener('transitionend', onEnd);

      // Double-rAF: ensures browser paints initial state before triggering slide
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          track.style.transform = direction === 'right' ? 'translateX(-50%)' : 'translateX(0)';
        });
      });
    });
  });

  // Expose for programmatic navigation (e.g. search)
  (window as unknown as { swup: Swup }).swup = swup;

  return swup;
}
