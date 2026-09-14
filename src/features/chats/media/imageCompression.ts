const maxDimension = 1600
const quality = 0.82

function canvasToBlob(canvas: HTMLCanvasElement, type: string, qualityValue: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Image compression failed.'))
      },
      type,
      qualityValue
    )
  })
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) return createImageBitmap(file)
  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('Image preview failed.'))
      element.src = url
    })
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function compressImage(file: File) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  const image = await decode(file)
  const { width, height } = image
  const scale = Math.min(1, maxDimension / Math.max(width, height))
  const targetWidth = Math.max(1, Math.round(width * scale))
  const targetHeight = Math.max(1, Math.round(height * scale))
  if (scale === 1 && file.size <= 900_000) return file
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const context = canvas.getContext('2d')
  if (!context) return file
  context.drawImage(image, 0, 0, targetWidth, targetHeight)
  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const blob = await canvasToBlob(canvas, outputType, outputType === 'image/png' ? 0.92 : quality)
  if ('close' in image && typeof image.close === 'function') image.close()
  if (blob.size >= file.size) return file
  const extension = outputType === 'image/png' ? 'png' : 'jpg'
  const name = file.name.replace(/\.[^.]+$/u, '') + `.${extension}`
  return new File([blob], name, { type: outputType, lastModified: Date.now() })
}

export async function compressImages(files: File[]) {
  return Promise.all(files.map((file) => compressImage(file)))
}
