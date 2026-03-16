/**
 * Custom tab controller for Webflow native tabs.
 * Handles tab switching independently of Webflow's JS (which breaks after SPA navigation).
 * Supports deep-linking via ?tab=slug query param.
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Switch to a specific tab by its data-w-tab value.
 * Toggles w--current on links and w--tab-active on panes.
 */
function switchTab(tabsContainer: Element, tabId: string): void {
  // Update links
  tabsContainer.querySelectorAll<HTMLElement>('.w-tab-link').forEach((link) => {
    link.classList.toggle('w--current', link.getAttribute('data-w-tab') === tabId);
  });

  // Update panes
  tabsContainer.querySelectorAll<HTMLElement>('.w-tab-pane').forEach((pane) => {
    pane.classList.toggle('w--tab-active', pane.getAttribute('data-w-tab') === tabId);
  });
}

/**
 * Set up click delegation for all Webflow tabs on the page.
 * Call once — uses event delegation on document so it works across Swup navigations.
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
      const tabsContainer = link.closest('.w-tabs');
      if (!tabId || !tabsContainer) return;

      switchTab(tabsContainer, tabId);
    },
    true
  );
}

/**
 * Activate the tab matching the ?tab= query param, then clean the URL.
 * Call on page load and after each Swup navigation.
 */
export function activateTabFromURL(): void {
  const url = new URL(window.location.href);
  const tabSlug = url.searchParams.get('tab');
  if (!tabSlug) return;

  const tabLinks = document.querySelectorAll<HTMLElement>('.w-tab-link');
  for (const link of tabLinks) {
    const tabName = link.getAttribute('data-w-tab');
    if (tabName && slugify(tabName) === tabSlug) {
      const tabsContainer = link.closest('.w-tabs');
      if (tabsContainer) switchTab(tabsContainer, tabName);
      break;
    }
  }

  // Remove ?tab= from URL
  url.searchParams.delete('tab');
  const cleanURL = url.searchParams.toString()
    ? `${url.pathname}?${url.searchParams}`
    : url.pathname;
  window.history.replaceState({}, '', cleanURL);
}
