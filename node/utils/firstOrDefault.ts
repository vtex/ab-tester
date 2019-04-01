export const firstOrDefault = (header: string | string[] | undefined): string => {
  if (header == undefined) {
    return ''
  }
  if (typeof header === 'string') {
    return header
  }
  return header.length > 0 ? header[0] : ''
}