import Swup from 'swup';

import { activateTabFromURL, slugify } from './tabDeepLink';

const SEL = {
  input: '[search="input"]',
  close: '[search="close"]',
  loupe: '[search="loupe"]',
  resultWrapper: '[search="result-wrapper"]',
  mainWrapper: '[search="main-wrapper"]',
  link: '[search="link"]',
} as const;

let cleanup: (() => void) | null = null;
let savedBasePadding: string | null = null;

/* ── Search bar expand / collapse ─────────────────────── */

export function initSearch(): void {
  const input = document.querySelector<HTMLInputElement>(SEL.input);
  const close = document.querySelector<HTMLElement>(SEL.close);
  const loupe = document.querySelector<HTMLElement>(SEL.loupe);
  const resultWrapper = document.querySelector<HTMLElement>(SEL.resultWrapper);
  const mainWrapper = document.querySelector<HTMLElement>(SEL.mainWrapper);
  const navBrand = document.querySelector<HTMLElement>('.nav_brand');
  if (!input || !close || !loupe || !resultWrapper || !mainWrapper) return;

  // Read basePadding from CSS only once — inline styles from a previous init would shadow it
  if (!savedBasePadding) {
    const prev = input.style.padding;
    input.style.padding = '';
    savedBasePadding = getComputedStyle(input).padding;
    input.style.padding = prev;
  }
  const basePadding = savedBasePadding;
  let isOpen = false;

  // Collapsed initial state
  Object.assign(input.style, {
    display: 'none',
    width: '0',
    padding: '0',
    overflow: 'hidden',
    transition: 'width 0.3s ease, padding 0.3s ease',
  });
  close.style.display = 'none';
  resultWrapper.style.display = 'none';

  const collapse = (instant = false) => {
    if (instant) {
      input.style.transition = 'none';
      input.style.width = '0';
      input.style.padding = '0';
      input.style.display = 'none';
      // Restore transition for next open/close
      void input.offsetWidth;
      input.style.transition = 'width 0.3s ease, padding 0.3s ease';
    } else {
      input.style.width = '0';
      input.style.padding = '0';
      input.addEventListener(
        'transitionend',
        () => {
          if (!isOpen) input.style.display = 'none';
        },
        { once: true }
      );
    }
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    close.style.display = 'none';
    resultWrapper.style.display = 'none';
    loupe.classList.remove('is-active');
    navBrand?.style.setProperty('z-index', '1');
    isOpen = false;
  };

  const updateVisibility = () => {
    const hasText = input.value.trim().length > 0;
    close.style.display = hasText ? 'flex' : 'none';
    resultWrapper.style.display = hasText ? 'flex' : 'none';
  };

  const onLoupe = () => {
    if (isOpen) {
      collapse();
      return;
    }
    input.style.display = 'flex';
    void input.offsetWidth; // reflow
    input.style.width = window.innerWidth < 479 ? 'calc(100% - 1rem)' : '100%';
    input.style.padding = basePadding;
    input.focus();
    loupe.classList.add('is-active');
    navBrand?.style.setProperty('z-index', '0');
    isOpen = true;
  };

  const onClose = () => {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    updateVisibility();
    input.focus();
  };

  const onClickOutside = (e: MouseEvent) => {
    if (isOpen && !mainWrapper.contains(e.target as Node)) collapse();
  };

  const onLinkClick = (e: MouseEvent) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>(SEL.link);
    if (!link) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const cat = link.getAttribute('search-cat');
    if (!cat) return;

    const sousCat = link.getAttribute('search-sous-cat');
    const tabSlug = sousCat ? slugify(sousCat) : '';
    const targetPath = `/${cat}`;
    const url = tabSlug ? `${targetPath}?tab=${tabSlug}` : targetPath;

    collapse(true);

    // If already on the target page, skip Swup animation — just switch tab
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    if (currentPath === targetPath) {
      if (tabSlug) {
        window.history.replaceState({}, '', url);
        activateTabFromURL();
      }
      return;
    }

    const { swup } = window as unknown as { swup: Swup };
    swup.navigate(url);
  };

  loupe.addEventListener('click', onLoupe);
  close.addEventListener('click', onClose);
  input.addEventListener('input', updateVisibility);
  document.addEventListener('click', onClickOutside);
  document.addEventListener('click', onLinkClick, true);

  cleanup = () => {
    loupe.removeEventListener('click', onLoupe);
    close.removeEventListener('click', onClose);
    input.removeEventListener('input', updateVisibility);
    document.removeEventListener('click', onClickOutside);
    document.removeEventListener('click', onLinkClick, true);
  };
}

export function destroySearch(): void {
  cleanup?.();
  cleanup = null;
}
