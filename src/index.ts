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

import { initButtonIconGradient } from './animations/buttonIconGradient';
import { destroyGradientAnimation, initGradientAnimation } from './decorative/gradientAnimation';
import { destroyFsAttributes, initFsAttributes, restartFsAttributes } from './swup/fsAttributes';
import { destroyFsLibrariesScripts, initFsLibrariesScripts } from './swup/fsLibraries';
import { initSwup } from './swup/swupTransition';
import { initMarker } from './utils/marker';
import { destroyNavbar, initNavbar, resetNavbar, updateNavBrandColor } from './utils/navbar';
import { destroySearch, initSearch } from './utils/search';
import { activateTabFromURL, setupTabs } from './utils/tabDeepLink';
import { initTopNavLoop } from './utils/topNavLoop';

/*
 *==========================================
 * CALL - GLOBAL FUNCTIONS
 *==========================================
 */

const initGlobalFunctions = (): void => {
  // Scripts
  initFsAttributes();
  initFsLibrariesScripts();
  initNavbar();
  initSearch();
  initGradientAnimation();
  initButtonIconGradient();
  initMarker();
  updateNavBrandColor();
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

  // Top nav marquee — outside #swup, init once and never destroy
  initTopNavLoop();

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
   * visit:start — Reset navbar dès le début de la navigation
   */
  swup.hooks.on('visit:start', () => {
    resetNavbar();
  });

  /**
   * content:replace — Nouveau DOM injecté, on détruit l'ancien
   */
  swup.hooks.on('content:replace', () => {
    destroyFsAttributes();
    destroyFsLibrariesScripts();
    destroyNavbar();
    destroySearch();
    destroyGradientAnimation();

    // Init gradients immediately so they're ready before page animates in
    initGradientAnimation();

    // Update nav brand color for the new page immediately
    updateNavBrandColor();

    activateTabFromURL();
  });

  /**
   * animation:in:end — Animation terminée + DOM nettoyé, on réinitialise
   */
  swup.hooks.on('animation:in:end', () => {
    initGlobalFunctions();
    restartFsAttributes();
    restartWebflow();
  });

  /**
   * page:view — Re-init when animation is skipped (e.g. search navigation)
   * animation:in:end won't fire when animate: false, so handle it here.
   */
  swup.hooks.on('page:view', (visit) => {
    if (visit.animation.animate === false) {
      initGlobalFunctions();
      restartFsAttributes();
      restartWebflow();
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
