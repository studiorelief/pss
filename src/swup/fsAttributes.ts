/*
 *==========================================
 * CONFIGURATION
 *==========================================
 */

// Finsweet Attributes v2 modules to load — add/remove modules here only
const FS_ATTRIBUTES_MODULES = ['list'] as const;

// Generate attribute names from module names (adds 'fs-' prefix)
const FS_ATTRIBUTES = FS_ATTRIBUTES_MODULES.map((module) => `fs-${module}` as const);

/*
 *==========================================
 * TYPES
 *==========================================
 */

interface FinsweetAttributesModule {
  restart?: () => void;
  destroy?: () => void;
}

interface FinsweetAttributesModules {
  [key: string]: FinsweetAttributesModule;
}

interface FinsweetAttributes {
  destroy: () => void;
  restart?: () => void;
  modules?: FinsweetAttributesModules;
}

interface WindowWithFinsweet extends Window {
  FinsweetAttributes?: FinsweetAttributes;
}

/*
 *==========================================
 * INIT / DESTROY / RESTART
 *==========================================
 */

const FS_ATTRIBUTES_SRC = 'https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js';

let scriptLoaded = false;

export function initFsAttributes(): void {
  if (typeof window !== 'undefined' && (window as WindowWithFinsweet).FinsweetAttributes) {
    return;
  }

  const alreadyInDom = Array.from(document.querySelectorAll('script')).some(
    (s) =>
      s.src === FS_ATTRIBUTES_SRC ||
      s.src.includes('@finsweet/attributes@2/attributes.js') ||
      FS_ATTRIBUTES.some((attr) => s.hasAttribute(attr))
  );

  if (alreadyInDom || scriptLoaded) return;

  const script = document.createElement('script');
  script.src = FS_ATTRIBUTES_SRC;
  script.async = true;
  script.type = 'module';

  FS_ATTRIBUTES.forEach((attr) => script.setAttribute(attr, ''));

  document.head.appendChild(script);
  scriptLoaded = true;
}

export function destroyFsAttributes(): void {
  if (typeof window === 'undefined') return;

  const { FinsweetAttributes } = window as WindowWithFinsweet;

  if (FinsweetAttributes) {
    try {
      FinsweetAttributes.destroy();
    } catch {
      // Silently fail
    }
  }
}

export function restartFsAttributes(retryCount = 0): void {
  if (typeof window === 'undefined') return;

  const { FinsweetAttributes } = window as WindowWithFinsweet;

  if (!FinsweetAttributes) {
    if (retryCount < 3) {
      setTimeout(() => restartFsAttributes(retryCount + 1), 0);
    }
    return;
  }

  try {
    if (FinsweetAttributes.restart && typeof FinsweetAttributes.restart === 'function') {
      FinsweetAttributes.restart();
      return;
    }

    const { modules } = FinsweetAttributes;
    if (modules && typeof modules === 'object') {
      FS_ATTRIBUTES_MODULES.forEach((moduleName) => {
        const mod = modules[moduleName];
        if (mod?.restart && typeof mod.restart === 'function') {
          try {
            mod.restart();
          } catch {
            // Silently fail
          }
        }
      });
    }
  } catch {
    // Silently fail
  }
}
