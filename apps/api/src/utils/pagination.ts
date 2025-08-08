export function getPageOffset(page: string, limit: string): number {
  return (Number(page) - 1) * Number(limit);
}
