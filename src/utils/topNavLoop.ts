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

export async function initTopNavLoop(): Promise<void> {
  await document.fonts.ready;

  const component = document.querySelector<HTMLElement>('.top-nav_component');
  if (!component) return;

  const wrapper = component.querySelector<HTMLElement>('.top-nav_wrapper');
  if (!wrapper) return;

  const wrapperWidth = wrapper.offsetWidth;
  const viewportWidth = window.innerWidth;
  const clonesNeeded = Math.ceil(viewportWidth / wrapperWidth) + 1;

  for (let i = 0; i < clonesNeeded; i++) {
    const clone = wrapper.cloneNode(true) as HTMLElement;
    clone.setAttribute('aria-hidden', 'true');
    component.appendChild(clone);
  }

  const wrappers = gsap.utils.toArray<HTMLElement>('.top-nav_wrapper', component);
  const count = wrappers.length;
  const totalWidth = wrapperWidth * count;
  const pixelsPerSecond = 30;

  // Preserve original padding before switching to absolute positioning
  const compStyle = getComputedStyle(component);
  const padTop = parseFloat(compStyle.paddingTop);
  const padLeft = parseFloat(compStyle.paddingLeft);
  const paddingY = padTop + parseFloat(compStyle.paddingBottom);

  gsap.set(component, { position: 'relative', overflow: 'hidden' });
  gsap.set(wrappers, {
    position: 'absolute',
    left: padLeft,
    top: padTop,
    x: (i: number) => i * wrapperWidth,
  });
  component.style.height = `${wrapper.offsetHeight + paddingY}px`;

  // Seamless loop using modifiers — no repeat jump
  tween = gsap.to(wrappers, {
    x: `-=${totalWidth}`,
    duration: totalWidth / pixelsPerSecond,
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize(gsap.utils.wrap(-wrapperWidth, totalWidth - wrapperWidth)),
    },
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
