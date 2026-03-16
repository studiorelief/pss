/**
 * Hide `.nav_component` on scroll down, show on scroll up.
 */

let lastScrollY = 0;
let ticking = false;

const NAVBAR_SELECTOR = '.nav_container';

function update() {
  const nav = document.querySelector<HTMLElement>(NAVBAR_SELECTOR);
  if (!nav) return;

  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY) {
    // Scrolling down → hide
    nav.style.transform = 'translateY(-200%)';
  } else {
    // Scrolling up → show
    nav.style.transform = 'translateY(0)';
  }

  lastScrollY = currentScrollY;
  ticking = false;
}

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(update);
    ticking = true;
  }
}

export function initNavbar(): void {
  const nav = document.querySelector<HTMLElement>(NAVBAR_SELECTOR);
  if (!nav) return;

  // Ensure smooth CSS transition
  nav.style.transition = 'transform 0.3s ease';

  lastScrollY = window.scrollY;
  window.addEventListener('scroll', onScroll, { passive: true });
}

export function resetNavbar(): void {
  const nav = document.querySelector<HTMLElement>(NAVBAR_SELECTOR);
  if (nav) nav.style.transform = 'translateY(0)';
  lastScrollY = 0;
}

export function destroyNavbar(): void {
  window.removeEventListener('scroll', onScroll);
  resetNavbar();
}
