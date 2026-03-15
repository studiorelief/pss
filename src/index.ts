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
   * page:view — Nouveau contenu visible, on réinitialise
   */
  swup.hooks.on('page:view', () => {
    initGlobalFunctions();
  });

  /**
   * visit:end — Animation terminée, on restart Webflow
   */
  swup.hooks.on('visit:end', () => {
    restartWebflow();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
