export function getThumbUrl (url: string, name = 'thumb', format = 'jpg'): string {
  const thumb = new URL(url.replace(/\.(jpg|png)$/i, ''))

  thumb.searchParams.set('format', format)
  thumb.searchParams.set('name', name)

  return thumb.toString()
}
