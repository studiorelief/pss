declare module '@swup/ga-plugin' {
  import type SwupPlugin from '@swup/plugin';

  interface SwupGaPluginOptions {
    gaMeasurementId: string;
  }

  class SwupGaPlugin extends SwupPlugin {
    name: 'swupGaPlugin';
    isSwupPlugin: true;
    constructor(options: SwupGaPluginOptions);
    mount(): void;
    unmount(): void;
  }

  export default SwupGaPlugin;
}
