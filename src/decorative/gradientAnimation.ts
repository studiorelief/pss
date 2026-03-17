/**
 * Animated gradient blobs for every .bg-layer-animation on the page.
 * Each layer gets its own set of randomised blobs + dark overlay.
 * First load: fade-in. Swup navigation: instant (blobs ready before page slides in).
 * Mouse parallax via GSAP.
 */

import './gradient-animation.css';

import gsap from 'gsap';

const COLORS = ['var(--brand--blue-900)', 'var(--brand--pink-900)'];
const BLOB_COUNT = 8;
const DATA_INIT = 'data-gradient-init';

interface BlobRef {
  el: HTMLElement;
  depth: number;
}

const allBlobs: BlobRef[] = [];
let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
let mouseLeaveHandler: (() => void) | null = null;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function generateBlob(index: number, uid: string) {
  const isPink = index === 3 || index === 7;
  const color = isPink ? COLORS[1] : COLORS[0];
  const size = rand(40, 70);
  const x = rand(-10, 100);
  const y = rand(-10, 100);
  const duration = rand(6, 12);
  const opacity = isPink ? rand(0.55, 0.75) : rand(0.5, 0.7);
  const depth = rand(0.3, 1);

  const dx1 = rand(15, 30) * (index % 2 === 0 ? 1 : -1);
  const dy1 = rand(8, 18);
  const dx2 = rand(10, 25) * (index % 2 === 0 ? -1 : 1);
  const dy2 = rand(-15, -5);

  const animName = `blob-${uid}-${index}`;

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
    animation: `${animName} ${duration}s ease-in-out infinite`,
  };

  return { keyframes, inlineStyle, depth };
}

let uidCounter = 0;

function populateLayer(layer: HTMLElement): void {
  const uid = String(uidCounter);
  uidCounter += 1;
  let css = '';

  for (let i = 0; i < BLOB_COUNT; i += 1) {
    const { keyframes, inlineStyle, depth } = generateBlob(i, uid);
    css += keyframes;

    const el = document.createElement('div');
    el.className = 'gradient-blob';
    Object.assign(el.style, inlineStyle);
    layer.appendChild(el);
    allBlobs.push({ el, depth });
  }

  const styleTag = document.createElement('style');
  styleTag.textContent = css;
  layer.appendChild(styleTag);

  // Dark overlay as sibling before the layer
  const parent = layer.parentElement;
  if (parent && !parent.querySelector('[data-gradient-overlay]')) {
    const overlay = document.createElement('div');
    overlay.className = 'gradient-overlay';
    overlay.dataset.gradientOverlay = 'true';
    parent.insertBefore(overlay, layer);
  }

  layer.setAttribute(DATA_INIT, 'true');

  // Fade in from 0 → 1
  gsap.fromTo(layer, { opacity: 0 }, { opacity: 1, delay: 0, duration: 1.5, ease: 'power2.out' });

  const overlay = parent?.querySelector<HTMLElement>('.gradient-overlay');
  if (overlay) {
    gsap.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, delay: 0, duration: 1.5, ease: 'power2.out' }
    );
  }
}

function ensureMouseParallax(): void {
  if (mouseMoveHandler) return;

  const maxShift = 40;

  mouseMoveHandler = (e: MouseEvent) => {
    allBlobs.forEach(({ el, depth }) => {
      const rect = el.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      gsap.to(el, {
        x: mx * maxShift * depth,
        y: my * maxShift * depth,
        duration: 1.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  };

  mouseLeaveHandler = () => {
    allBlobs.forEach(({ el }) => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 1.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  };

  document.addEventListener('mousemove', mouseMoveHandler);
  document.addEventListener('mouseleave', mouseLeaveHandler);
}

export function initGradientAnimation(): void {
  const layers = document.querySelectorAll<HTMLElement>(`.bg-layer-animation:not([${DATA_INIT}])`);

  layers.forEach((layer) => populateLayer(layer));
  ensureMouseParallax();
}

export function destroyGradientAnimation(): void {
  // Remove injected blobs, style tags, overlays
  document.querySelectorAll('.gradient-blob').forEach((el) => el.remove());
  document.querySelectorAll('[data-gradient-overlay]').forEach((el) => el.remove());
  document.querySelectorAll(`[${DATA_INIT}]`).forEach((el) => el.removeAttribute(DATA_INIT));

  allBlobs.length = 0;
}
