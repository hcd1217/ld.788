import type { Plugin } from 'vite';

/**
 * Vite plugin to transform HTML files with environment variables
 * Replaces placeholders in HTML with actual values from environment
 */
export function htmlTransformPlugin(): Plugin {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      const appName = process.env.VITE_APP_NAME || 'CMngt';
      const appDescription =
        process.env.VITE_APP_DESCRIPTION || 'CMngt Progressive Web Application';
      const themeColor = `#${process.env.VITE_THEME_COLOR || '324e71'}`;

      return (
        html
          // Replace title
          .replace(/<title>.*?<\/title>/, `<title>${appName} App</title>`)
          // Replace meta description
          .replace(
            /<meta name="description" content=".*?"/,
            `<meta name="description" content="${appDescription}"`,
          )
          // Replace OpenGraph tags
          .replace(
            /<meta property="og:title" content=".*?"/,
            `<meta property="og:title" content="${appName} App"`,
          )
          .replace(
            /<meta property="og:description" content=".*?"/,
            `<meta property="og:description" content="${appDescription} - Your trusted business management platform"`,
          )
          .replace(
            /<meta property="og:site_name" content=".*?"/,
            `<meta property="og:site_name" content="${appName} App"`,
          )
          // Replace Twitter Card tags
          .replace(
            /<meta name="twitter:title" content=".*?"/,
            `<meta name="twitter:title" content="${appName} App"`,
          )
          .replace(
            /<meta name="twitter:description" content=".*?"/,
            `<meta name="twitter:description" content="${appDescription} - Your trusted business management platform"`,
          )
          .replace(
            /<meta name="twitter:image:alt" content=".*?"/,
            `<meta name="twitter:image:alt" content="${appName} App Logo"`,
          )
          // Replace apple-mobile-web-app-title
          .replace(
            /<meta name="apple-mobile-web-app-title" content=".*?"/,
            `<meta name="apple-mobile-web-app-title" content="${appName}"`,
          )
          // Replace theme-color meta tag
          .replace(
            /<meta name="theme-color" content=".*?"/,
            `<meta name="theme-color" content="${themeColor}"`,
          )
          // Replace mask-icon color
          .replace(
            /<link rel="mask-icon" href="\/mask-icon.svg" color=".*?"/,
            `<link rel="mask-icon" href="/mask-icon.svg" color="${themeColor}"`,
          )
      );
    },
  };
}
