export function detectTightBounds(imageElement, tolerance = 15) {
  const canvas = document.createElement('canvas')
  const ctx    = canvas.getContext('2d')

  canvas.width  = imageElement.naturalWidth
  canvas.height = imageElement.naturalHeight

  ctx.drawImage(imageElement, 0, 0)

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)

  let minX = canvas.width
  let minY = canvas.height
  let maxX = 0
  let maxY = 0

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx   = (y * canvas.width + x) * 4
      const r     = data[idx]
      const g     = data[idx + 1]
      const b     = data[idx + 2]
      const alpha = data[idx + 3]

      const isTransparent = alpha < 10
      const isWhite       = r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance
      const isNearWhite   = r > 240 && g > 240 && b > 240

      if (!isTransparent && !isWhite && !isNearWhite) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (minX >= maxX || minY >= maxY) {
    return {
      unit:   'px',
      x:      0,
      y:      0,
      width:  canvas.width,
      height: canvas.height,
    }
  }

  const padding = 4
  return {
    unit:   'px',
    x:      Math.max(0, minX - padding),
    y:      Math.max(0, minY - padding),
    width:  Math.min(canvas.width,  maxX - minX + padding * 2),
    height: Math.min(canvas.height, maxY - minY + padding * 2),
  }
}

export function getCroppedBlob(imageElement, pixelCrop) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx    = canvas.getContext('2d')

    canvas.width  = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
      imageElement,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    )

    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas toBlob failed'))
    }, 'image/png')
  })
}