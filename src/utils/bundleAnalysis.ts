// Bundle analysis utility for tracking lazy loading effectiveness
import process from 'node:process';

export const bundleAnalysis = {
  // Track component loading times
  componentLoadTimes: new Map<string, number>(),

  // Track icon loading times
  iconLoadTimes: new Map<string, number>(),

  // Track bundle sizes (to be populated by build tools)
  bundleSizes: {
    main: 0,
    icons: 0,
    components: 0,
    chunks: new Map<string, number>(),
  },

  // Performance metrics
  metrics: {
    initialLoadTime: 0,
    timeToInteractive: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
  },

  // Log component load performance
  logComponentLoad(componentName: string, loadTime: number) {
    this.componentLoadTimes.set(componentName, loadTime);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Bundle Analysis] ${componentName} loaded in ${loadTime}ms`);
    }
  },

  // Log icon load performance
  logIconLoad(iconName: string, loadTime: number) {
    this.iconLoadTimes.set(iconName, loadTime);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Bundle Analysis] Icon ${iconName} loaded in ${loadTime}ms`);
    }
  },

  // Get summary report
  getSummary() {
    const avgComponentLoadTime =
      [...this.componentLoadTimes.values()].reduce(
        (sum, time) => sum + time,
        0,
      ) / this.componentLoadTimes.size;

    const avgIconLoadTime =
      [...this.iconLoadTimes.values()].reduce((sum, time) => sum + time, 0) /
      this.iconLoadTimes.size;

    return {
      componentsLoaded: this.componentLoadTimes.size,
      iconsLoaded: this.iconLoadTimes.size,
      avgComponentLoadTime: avgComponentLoadTime || 0,
      avgIconLoadTime: avgIconLoadTime || 0,
      totalLoadTime: avgComponentLoadTime + avgIconLoadTime,
      bundleSizes: this.bundleSizes,
      metrics: this.metrics,
    };
  },

  // Export data for analysis
  exportData() {
    return {
      componentLoadTimes: Object.fromEntries(this.componentLoadTimes),
      iconLoadTimes: Object.fromEntries(this.iconLoadTimes),
      bundleSizes: {
        ...this.bundleSizes,
        chunks: Object.fromEntries(this.bundleSizes.chunks),
      },
      metrics: this.metrics,
      timestamp: new Date().toISOString(),
    };
  },
};

// Hook for tracking performance in development
export function useBundleAnalysis() {
  const logComponentLoad = (componentName: string, loadTime: number) => {
    bundleAnalysis.logComponentLoad(componentName, loadTime);
  };

  const logIconLoad = (iconName: string, loadTime: number) => {
    bundleAnalysis.logIconLoad(iconName, loadTime);
  };

  const getSummary = () => bundleAnalysis.getSummary();
  const exportData = () => bundleAnalysis.exportData();

  return {
    logComponentLoad,
    logIconLoad,
    getSummary,
    exportData,
  };
}
