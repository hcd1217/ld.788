import { matchRoutes, type RouteObject } from 'react-router';

type ThemeRouteObject = RouteObject & {
  theme?: string;
  children?: ThemeRouteObject[];
};

/**
 * Extract theme from matched routes
 * Traverses from child to parent to find the first defined theme
 */
export function getThemeForRoute(pathname: string, routes: ThemeRouteObject[]): string {
  const matches = matchRoutes(routes, pathname);

  if (!matches) {
    return 'elegant'; // Default theme
  }

  // Traverse matches from most specific to least specific
  // Child routes can override parent themes
  for (let i = matches.length - 1; i >= 0; i--) {
    const route = matches[i].route as ThemeRouteObject;
    if (route.theme) {
      return route.theme;
    }
  }

  return 'elegant'; // Default theme if no theme found
}

/**
 * Alternative: Build a route-to-theme map for faster lookups
 * This can be used if performance becomes a concern with many routes
 */
export function buildRouteThemeMap(routes: ThemeRouteObject[]): Map<string, string> {
  const map = new Map<string, string>();

  function traverse(
    routeList: ThemeRouteObject[],
    inheritedTheme: string = 'elegant',
    parentPath: string = '',
  ) {
    routeList.forEach((route) => {
      const theme = route.theme || inheritedTheme;
      const fullPath = parentPath + (route.path || '');

      if (route.path) {
        map.set(fullPath, theme);
      }

      if (route.children) {
        traverse(route.children, theme, fullPath);
      }
    });
  }

  traverse(routes);
  return map;
}
