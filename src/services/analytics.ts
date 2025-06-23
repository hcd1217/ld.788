export function trackRouteChange(
  from?: string,
  to?: string,
  properties?: Record<string, unknown>,
) {
  console.warn('route changed', {
    from,
    to,
    properties,
  });
}
