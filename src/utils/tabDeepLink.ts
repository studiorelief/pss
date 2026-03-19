/**
 * Custom tab controller for Webflow native tabs.
 * Replaces Webflow's JS (which breaks after SPA navigation).
 * Supports deep-linking via ?tab=slug query param.
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Toggle w--current on links and w--tab-active on panes. */
export function switchTab(container: Element, tabId: string): void {
  container.querySelectorAll<HTMLElement>('.w-tab-link').forEach((link) => {
    link.classList.toggle('w--current', link.getAttribute('data-w-tab') === tabId);
  });
  container.querySelectorAll<HTMLElement>('.w-tab-pane').forEach((pane) => {
    pane.classList.toggle('w--tab-active', pane.getAttribute('data-w-tab') === tabId);
  });
}

/**
 * Event-delegated click handler for all tab links.
 * Call once — persists across Swup navigations.
 */
export function setupTabs(): void {
  document.addEventListener(
    'click',
    (e) => {
      const link = (e.target as HTMLElement).closest<HTMLElement>('.w-tab-link');
      if (!link) return;

      e.preventDefault();
      e.stopPropagation();

      const tabId = link.getAttribute('data-w-tab');
      const container = link.closest('.w-tabs');
      if (!tabId || !container) return;

      // Flag for CSS animations — only on user click
      const menu = container.querySelector('.w-tab-menu');
      if (menu) {
        menu.classList.add('is-tab-switching');
        setTimeout(() => menu.classList.remove('is-tab-switching'), 600);
      }

      switchTab(container, tabId);
    },
    true
  );
}

/** Activate the tab matching ?tab= then clean the URL. */
export function activateTabFromURL(): void {
  const url = new URL(window.location.href);
  const tabSlug = url.searchParams.get('tab');
  if (!tabSlug) return;

  for (const link of document.querySelectorAll<HTMLElement>('.w-tab-link')) {
    const name = link.getAttribute('data-w-tab');
    if (name && slugify(name) === tabSlug) {
      const container = link.closest('.w-tabs');
      if (container) switchTab(container, name);
      break;
    }
  }

  url.searchParams.delete('tab');
  const hash = url.hash || '';
  const clean = url.searchParams.toString()
    ? `${url.pathname}?${url.searchParams}${hash}`
    : `${url.pathname}${hash}`;
  window.history.replaceState({}, '', clean);
}

/** Open the accordion containing the hash anchor and scroll to it. */
export function activateAccordionFromHash(): void {
  const hash = window.location.hash?.slice(1);
  if (!hash) return;

  const anchor = document.getElementById(hash);
  if (!anchor) return;

  const accordionItem = anchor.closest<HTMLElement>('[fs-accordion-element="accordion"]');
  if (!accordionItem) return;

  const trigger = accordionItem.querySelector<HTMLElement>('[fs-accordion-element="trigger"]');
  if (!trigger) return;

  // Already open — just scroll
  if (trigger.getAttribute('aria-expanded') === 'true') {
    anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  trigger.click();

  // Wait for accordion open animation, then scroll
  setTimeout(() => {
    anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
}
