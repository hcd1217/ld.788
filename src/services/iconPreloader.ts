type IconPreloadEntry = {
  name: string;
  priority: 'high' | 'medium' | 'low';
  preloaded: boolean;
};

class IconPreloader {
  private readonly preloadQueue: IconPreloadEntry[] = [];
  private readonly preloadedIcons = new Set<string>();
  private isPreloading = false;

  addToQueue(
    iconName: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
  ): void {
    if (this.preloadedIcons.has(iconName)) {
      return;
    }

    const existingEntry = this.preloadQueue.find(
      (entry) => entry.name === iconName,
    );
    if (existingEntry) {
      if (priority === 'high' && existingEntry.priority !== 'high') {
        existingEntry.priority = 'high';
        this.sortQueue();
      }

      return;
    }

    this.preloadQueue.push({
      name: iconName,
      priority,
      preloaded: false,
    });

    this.sortQueue();
    this.processQueue();
  }

  async preloadIcon(iconName: string): Promise<void> {
    if (this.preloadedIcons.has(iconName)) {
      return;
    }

    try {
      await import('@tabler/icons-react');
      this.preloadedIcons.add(iconName);
    } catch (error) {
      console.warn(`Failed to preload icon ${iconName}:`, error);
    }
  }

  getPreloadedCount(): number {
    return this.preloadedIcons.size;
  }

  isIconPreloaded(iconName: string): boolean {
    return this.preloadedIcons.has(iconName);
  }

  preloadCriticalIcons(): void {
    const criticalIcons = [
      'IconAlertCircle',
      'IconCheck',
      'IconX',
      'IconLoader',
      'IconEye',
      'IconEyeOff',
    ];

    for (const iconName of criticalIcons) {
      this.addToQueue(iconName, 'high');
    }
  }

  private sortQueue(): void {
    this.preloadQueue.sort((a, b) => {
      const priorityOrder = {high: 0, medium: 1, low: 2};
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isPreloading) {
      return;
    }

    this.isPreloading = true;

    const processNext = async (): Promise<void> => {
      const entry = this.preloadQueue.find((e) => !e.preloaded);
      if (!entry) {
        this.isPreloading = false;
        return;
      }

      await this.preloadIcon(entry.name);
      entry.preloaded = true;

      if ('requestIdleCallback' in globalThis) {
        requestIdleCallback(() => {
          processNext();
        });
      } else {
        setTimeout(() => {
          processNext();
        }, 16);
      }
    };

    await processNext();
  }
}

export const iconPreloader = new IconPreloader();

export function useIconPreloader() {
  return {
    preloadIcon(iconName: string, priority?: 'high' | 'medium' | 'low') {
      iconPreloader.addToQueue(iconName, priority);
    },
    preloadCriticalIcons() {
      iconPreloader.preloadCriticalIcons();
    },
    isPreloaded: (iconName: string) => iconPreloader.isIconPreloaded(iconName),
    getPreloadedCount: () => iconPreloader.getPreloadedCount(),
  };
}
