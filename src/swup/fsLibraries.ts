const loadedScripts: HTMLScriptElement[] = [];

const FS_LIBRARIES_SRCS = [
  'https://cdn.jsdelivr.net/npm/@finsweet/attributes-accordion@1/accordion.js',
];

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');

    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
    loadedScripts.push(script);
  });
}

export function initFsLibrariesScripts() {
  return Promise.all(FS_LIBRARIES_SRCS.map(loadScript));
}

export function destroyFsLibrariesScripts(): void {
  loadedScripts.forEach((script) => {
    if (script.parentNode) {
      script.parentNode.removeChild(script);
    }
  });
  loadedScripts.length = 0;
}
