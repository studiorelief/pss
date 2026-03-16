/*
 *==========================================
 * GLOBAL - IMPORT
 *==========================================
 */

import './index.css';

/*
 *==========================================
 * FUNCTION - IMPORT
 *==========================================
 */
import { restartWebflow } from '@finsweet/ts-utils';

import { destroyFsLibrairiesScripts, initFsLibrairiesScripts } from './swup/fsLibrairies';
import { initSwup } from './swup/swupTransition';
import { activateTabFromURL, setupTabs } from './utils/tabDeepLink';

/*
 *==========================================
 * CALL - GLOBAL FUNCTIONS
 *==========================================
 */

const initGlobalFunctions = (): void => {
  // Scripts
  initFsLibrairiesScripts();
};

/*
 *==========================================
 * SWUP
 * ↳ INITIALIZATION
 *==========================================
 */

const init = () => {
  // Init global functions on first load
  initGlobalFunctions();

  // Tabs: custom click handler (replaces Webflow's broken tab JS after SPA nav)
  setupTabs();
  activateTabFromURL();

  // Intercept same-page ?tab= links: skip Swup transition, just scroll top + activate tab
  document.addEventListener(
    'click',
    (e) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href]:not(.w-tab-link)'
      );
      if (!anchor) return;

      const linkUrl = new URL(anchor.href, window.location.origin);
      const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
      const linkPath = linkUrl.pathname.replace(/\/$/, '') || '/';

      if (linkPath === currentPath && linkUrl.searchParams.has('tab')) {
        e.preventDefault();
        e.stopPropagation();
        window.history.pushState({}, '', anchor.href);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        activateTabFromURL();
      }
    },
    true
  );

  // Initialize Swup
  const swup = initSwup();

  /*
   *==========================================
   * SWUP
   * ↳ HOOKS
   *==========================================
   */

  /**
   * content:replace — Nouveau DOM injecté, on détruit l'ancien
   */
  swup.hooks.on('content:replace', () => {
    destroyFsLibrairiesScripts();
  });

  /**
   * animation:in:end — Animation terminée + DOM nettoyé, on réinitialise
   */
  swup.hooks.on('animation:in:end', () => {
    initGlobalFunctions();
    activateTabFromURL();
    restartWebflow();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
