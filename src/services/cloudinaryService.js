const CLOUDINARY_CLOUD_NAME   = 'dzqrelgbd'
const CLOUDINARY_UPLOAD_PRESET = 'TailorPadyUploads'
const CLOUDINARY_UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

const MAX_IMAGE_DIMENSION = 1200
const JPEG_QUALITY        = 0.82


async function compressImageBeforeUpload(imageFile) {
  return new Promise((resolve, reject) => {
    const image    = new Image()
    const imageUrl = URL.createObjectURL(imageFile)

    image.onload = () => {
      URL.revokeObjectURL(imageUrl)

      let targetWidth  = image.width
      let targetHeight = image.height

      const needsDownscaling = targetWidth > MAX_IMAGE_DIMENSION || targetHeight > MAX_IMAGE_DIMENSION

      if (needsDownscaling) {
        const isLandscape = targetWidth >= targetHeight
        if (isLandscape) {
          targetHeight = Math.round((targetHeight / targetWidth) * MAX_IMAGE_DIMENSION)
          targetWidth  = MAX_IMAGE_DIMENSION
        } else {
          targetWidth  = Math.round((targetWidth / targetHeight) * MAX_IMAGE_DIMENSION)
          targetHeight = MAX_IMAGE_DIMENSION
        }
      }

      const canvas        = document.createElement('canvas')
      canvas.width        = targetWidth
      canvas.height       = targetHeight

      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0, targetWidth, targetHeight)

      const outputMimeType = imageFile.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const outputQuality  = outputMimeType === 'image/png' ? 1 : JPEG_QUALITY

      canvas.toBlob(
        (compressedBlob) => compressedBlob
          ? resolve(compressedBlob)
          : reject(new Error('Image compression failed')),
        outputMimeType,
        outputQuality,
      )
    }

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      reject(new Error('Failed to load image for compression'))
    }

    image.src = imageUrl
  })
}


export async function uploadToCloudinary(imageFile, folder = 'general', onProgress = null) {

  const compressedImage = await compressImageBeforeUpload(imageFile)

  const formData = new FormData()
  formData.append('file',          compressedImage)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', `tailorpady/${folder}`)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', CLOUDINARY_UPLOAD_URL)

    if (onProgress) {
      xhr.upload.onprogress = (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentageUploaded = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          onProgress(percentageUploaded)
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const responseData = JSON.parse(xhr.responseText)
        resolve(responseData.secure_url)
      } else {
      
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))

    xhr.send(formData)
  })
}


export function isCloudinaryUrl(value) {
  return typeof value === 'string' && value.includes('cloudinary.com')
}