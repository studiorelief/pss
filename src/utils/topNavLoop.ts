import gsap from 'gsap';

/**
 * Infinite horizontal marquee on `.top-nav_component`.
 * Dynamically clones `.top-nav_wrapper` until the content is wide enough
 * to fill the viewport, then loops seamlessly with GSAP.
 */

let tween: gsap.core.Tween | null = null;
let hoverTarget: HTMLElement | null = null;
let handleEnter: (() => void) | null = null;
let handleLeave: (() => void) | null = null;

export function initTopNavLoop(): void {
  const component = document.querySelector<HTMLElement>('.top-nav_component');
  if (!component) return;

  const wrapper = component.querySelector<HTMLElement>('.top-nav_wrapper');
  if (!wrapper) return;

  // Calculate how many clones are needed to cover the viewport + 1 extra
  const wrapperWidth = wrapper.offsetWidth;
  const viewportWidth = window.innerWidth;
  const clonesNeeded = Math.ceil(viewportWidth / wrapperWidth);

  for (let i = 0; i < clonesNeeded; i++) {
    const clone = wrapper.cloneNode(true) as HTMLElement;
    clone.setAttribute('aria-hidden', 'true');
    component.appendChild(clone);
  }

  // Animate all wrappers together
  const wrappers = component.querySelectorAll<HTMLElement>('.top-nav_wrapper');

  tween = gsap.to(wrappers, {
    xPercent: -100,
    duration: 100,
    ease: 'none',
    repeat: -1,
  });

  // Pause on hover
  hoverTarget = component;
  handleEnter = () => tween?.pause();
  handleLeave = () => tween?.resume();
  component.addEventListener('mouseenter', handleEnter);
  component.addEventListener('mouseleave', handleLeave);
}

export function destroyTopNavLoop(): void {
  // Remove hover listeners
  if (hoverTarget && handleEnter && handleLeave) {
    hoverTarget.removeEventListener('mouseenter', handleEnter);
    hoverTarget.removeEventListener('mouseleave', handleLeave);
    hoverTarget = null;
    handleEnter = null;
    handleLeave = null;
  }

  if (tween) {
    tween.kill();
    tween = null;
  }

  // Remove all cloned wrappers (keep only the original)
  const component = document.querySelector<HTMLElement>('.top-nav_component');
  if (!component) return;

  const wrappers = component.querySelectorAll('.top-nav_wrapper');
  for (let i = wrappers.length - 1; i > 0; i--) {
    wrappers[i].remove();
  }
}
