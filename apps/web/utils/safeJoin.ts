export function safeJoin(
  values: (string | number | null | undefined)[],
  separator = ', ',
  fallback = 'N/A'
): string {
  const filtered = values.filter(Boolean) as string[];
  return filtered.length > 0 ? filtered.join(separator) : fallback;
}
