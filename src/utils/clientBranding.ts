import type {ClientPublicConfigResponse} from '@/lib/api';

/**
 * Updates the browser favicon with the client's logo
 * @param logoUrl - URL of the client's logo
 */
export const updateFavicon = (logoUrl: string | undefined): void => {
  if (!logoUrl) return;

  // Remove existing favicon links
  const existingLinks = document.querySelectorAll('link[rel*="icon"]');
  for (const link of existingLinks) link.remove();

  // Create new favicon link
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = logoUrl;
  document.head.append(link);

  // Also update apple-touch-icon for iOS devices
  const appleTouchIcon = document.createElement('link');
  appleTouchIcon.rel = 'apple-touch-icon';
  appleTouchIcon.href = logoUrl;
  document.head.append(appleTouchIcon);
};

/**
 * Updates the document title with the client's name
 * @param clientName - Name of the client
 */
export const updateDocumentTitle = (clientName: string | undefined): void => {
  if (clientName) {
    document.title = clientName;

    // Also update apple-mobile-web-app-title for iOS devices
    const appleTitleMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-title"]',
    );
    if (appleTitleMeta) {
      appleTitleMeta.setAttribute('content', clientName);
    }
  }
};

/**
 * Updates both favicon and title based on client config
 * @param config - Client public configuration
 */
export const updateClientBranding = (
  config: ClientPublicConfigResponse | undefined,
): void => {
  if (!config) return;

  updateFavicon(config.logoUrl);
  updateDocumentTitle(config.clientName);
};
