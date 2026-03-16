/**
 * Animated gradient blobs on .bg-layer-animation
 * Uses color-dodge blend mode over the background image beneath.
 * Wave-like motion with randomized positions per container.
 * Mouse interaction: blobs shift with a parallax effect on hover.
 */

import './gradient-animation.css';

import gsap from 'gsap';

const COLORS = ['var(--brand--blue-900)', 'var(--brand--pink-900)'];
const BLOB_COUNT = 8;

const mouseListeners = new Map<HTMLElement, (e: MouseEvent) => void>();
const leaveListeners = new Map<HTMLElement, () => void>();

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function generateBlob(id: string, index: number) {
  // ~20% pink: only indices 3 and 7 out of 8
  const isPink = index === 3 || index === 7;
  const color = isPink ? COLORS[1] : COLORS[0];
  const size = rand(40, 70);
  const x = rand(-10, 100);
  const y = rand(-10, 100);
  const duration = rand(6, 12);
  const delay = rand(0, 4);
  const opacity = isPink ? rand(0.55, 0.75) : rand(0.5, 0.7);
  const depth = rand(0.3, 1);

  const dx1 = rand(15, 30) * (index % 2 === 0 ? 1 : -1);
  const dy1 = rand(8, 18);
  const dx2 = rand(10, 25) * (index % 2 === 0 ? -1 : 1);
  const dy2 = rand(-15, -5);

  const animName = `blob-${id}-${index}`;

  const keyframes = `
@keyframes ${animName} {
  0%   { left: ${x}%; top: ${y}%; }
  25%  { left: ${x + dx1}%; top: ${y + dy1}%; }
  50%  { left: ${x + dx1 + dx2}%; top: ${y}%; }
  75%  { left: ${x + dx2}%; top: ${y + dy2}%; }
  100% { left: ${x}%; top: ${y}%; }
}`;

  const inlineStyle = {
    width: `${size}vw`,
    height: `${size}vw`,
    background: `radial-gradient(circle, ${color} 0%, ${color} 30%, transparent 70%)`,
    opacity: String(opacity),
    left: `${x}%`,
    top: `${y}%`,
    animation: `${animName} ${duration}s ease-in-out ${delay}s infinite`,
  };

  return { keyframes, inlineStyle, depth };
}

let instanceCounter = 0;

export function initGradientAnimation(): void {
  const containers = document.querySelectorAll<HTMLElement>('.bg-layer-animation');

  containers.forEach((container) => {
    const id = String(instanceCounter);
    instanceCounter += 1;
    container.dataset.blobId = id;

    // Dark overlay as sibling before the blend layer to darken the image behind
    if (!container.parentElement?.querySelector('[data-gradient-overlay]')) {
      const overlay = document.createElement('div');
      overlay.className = 'gradient-overlay';
      overlay.dataset.gradientOverlay = 'true';
      container.parentElement?.insertBefore(overlay, container);
    }

    let css = '';
    const blobs: { el: HTMLElement; depth: number }[] = [];

    for (let i = 0; i < BLOB_COUNT; i += 1) {
      const { keyframes, inlineStyle, depth } = generateBlob(id, i);
      css += keyframes;

      const el = document.createElement('div');
      el.className = 'gradient-blob';
      Object.assign(el.style, inlineStyle);
      container.appendChild(el);
      blobs.push({ el, depth });
    }

    const styleTag = document.createElement('style');
    styleTag.textContent = css;
    container.appendChild(styleTag);

    // Mouse parallax
    const maxShift = 40;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      blobs.forEach(({ el, depth }) => {
        gsap.to(el, {
          x: mx * maxShift * depth,
          y: my * maxShift * depth,
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    };

    const onMouseLeave = () => {
      blobs.forEach(({ el }) => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 1.5,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    mouseListeners.set(container, onMouseMove);
    leaveListeners.set(container, onMouseLeave);
  });
}

export function destroyGradientAnimation(): void {
  const containers = document.querySelectorAll<HTMLElement>('.bg-layer-animation');
  containers.forEach((container) => {
    const moveListener = mouseListeners.get(container);
    if (moveListener) {
      container.removeEventListener('mousemove', moveListener);
      mouseListeners.delete(container);
    }
    const leaveListener = leaveListeners.get(container);
    if (leaveListener) {
      container.removeEventListener('mouseleave', leaveListener);
      leaveListeners.delete(container);
    }

    container.parentElement?.querySelector('[data-gradient-overlay]')?.remove();
    container.innerHTML = '';
    delete container.dataset.blobId;
  });
}
