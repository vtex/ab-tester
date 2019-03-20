export const firstOrDefault = (header: string | string[]): string => {
  if (typeof header === 'string') {
    return header
  }
  return header.length > 0 ? header[0] : ''
}