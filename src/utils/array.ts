export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function skipEmpty<T>(array: T[]): T[] {
  return array.filter(Boolean);
}
