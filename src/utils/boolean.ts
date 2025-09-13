export function xOr(a: unknown, b: unknown): boolean {
  return (Boolean(a) || Boolean(b)) && !(Boolean(a) && Boolean(b));
}
