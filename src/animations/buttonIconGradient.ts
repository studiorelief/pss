const ORIGINAL_CLASS = 'original-paths';
const OVERLAY_CLASS = 'gradient-overlay';
const GRADIENT_PREFIX = 'button-icon-gradient';

export const initButtonIconGradient = (): void => {
  const wraps = document.querySelectorAll('.button_main_wrap');

  wraps.forEach((wrap, i) => {
    const svg = wrap.querySelector('.button_main_icon.is-left svg');
    if (!svg) return;

    // Skip if already initialized
    if (svg.querySelector(`.${OVERLAY_CLASS}`)) return;

    const viewBox = svg.getAttribute('viewBox');
    if (!viewBox) return;

    const [, , w, h] = viewBox.split(' ').map(Number);
    const gradientId = `${GRADIENT_PREFIX}-${i}`;

    // Inject <linearGradient> with userSpaceOnUse so all paths share one gradient space
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse"
        x1="0" y1="${h}" x2="${w}" y2="0">
        <stop offset="22%" stop-color="var(--brand--blue-900)" />
        <stop offset="100%" stop-color="var(--brand--pink-900)" />
      </linearGradient>
    `;
    svg.insertBefore(defs, svg.firstChild);

    // Wrap existing paths in a group so we can fade them out
    const paths = svg.querySelectorAll('path');
    const originalGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    originalGroup.classList.add(ORIGINAL_CLASS);
    paths.forEach((path) => originalGroup.appendChild(path));
    svg.appendChild(originalGroup);

    // Clone all paths into a gradient overlay group (sits on top, fades in on hover)
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    overlay.classList.add(OVERLAY_CLASS);

    originalGroup.querySelectorAll('path').forEach((path) => {
      const clone = path.cloneNode(true) as SVGPathElement;
      clone.setAttribute('fill', `url(#${gradientId})`);
      clone.removeAttribute('style');
      overlay.appendChild(clone);
    });

    svg.appendChild(overlay);
  });
};
