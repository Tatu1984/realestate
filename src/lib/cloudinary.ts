import { v2 as cloudinary } from 'cloudinary'
import { logger } from './logger'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// Check if Cloudinary is configured
export const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

interface UploadOptions {
  folder?: string
  transformation?: Record<string, unknown>[]
  resourceType?: 'image' | 'video' | 'raw' | 'auto'
  publicId?: string
}

interface CloudinaryResult {
  success: boolean
  url?: string
  publicId?: string
  error?: string
}

// Upload a file to Cloudinary
export async function uploadToCloudinary(
  file: File | Buffer | string,
  options: UploadOptions = {}
): Promise<CloudinaryResult> {
  if (!isCloudinaryConfigured) {
    logger.warn('Cloudinary not configured, using local storage fallback')
    return { success: false, error: 'Cloudinary not configured' }
  }

  try {
    const {
      folder = 'propestate',
      transformation,
      resourceType = 'auto',
      publicId,
    } = options

    let uploadData: string

    if (file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer())
      uploadData = `data:${file.type};base64,${buffer.toString('base64')}`
    } else if (Buffer.isBuffer(file)) {
      uploadData = `data:image/jpeg;base64,${file.toString('base64')}`
    } else {
      uploadData = file
    }

    const result = await cloudinary.uploader.upload(uploadData, {
      folder,
      resource_type: resourceType,
      transformation,
      public_id: publicId,
      overwrite: true,
    })

    logger.info('Cloudinary upload successful', {
      publicId: result.public_id,
      url: result.secure_url,
    })

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    logger.error('Cloudinary upload failed', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

// Upload multiple files
export async function uploadMultipleToCloudinary(
  files: File[],
  options: UploadOptions = {}
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = []
  const errors: string[] = []

  for (const file of files) {
    const result = await uploadToCloudinary(file, options)
    if (result.success && result.url) {
      urls.push(result.url)
    } else {
      errors.push(result.error || 'Unknown error')
    }
  }

  return { urls, errors }
}

// Upload property images with optimized transformations
export async function uploadPropertyImage(file: File): Promise<CloudinaryResult> {
  return uploadToCloudinary(file, {
    folder: 'propestate/properties',
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto:best' },
      { fetch_format: 'auto' },
    ],
  })
}

// Upload avatar with optimized transformations
export async function uploadAvatar(file: File): Promise<CloudinaryResult> {
  return uploadToCloudinary(file, {
    folder: 'propestate/avatars',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  })
}

// Upload document
export async function uploadDocument(file: File): Promise<CloudinaryResult> {
  return uploadToCloudinary(file, {
    folder: 'propestate/documents',
    resourceType: 'raw',
  })
}

// Delete a file from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!isCloudinaryConfigured) {
    return false
  }

  try {
    await cloudinary.uploader.destroy(publicId)
    logger.info('Cloudinary file deleted', { publicId })
    return true
  } catch (error) {
    logger.error('Cloudinary delete failed', error)
    return false
  }
}

// Generate optimized URL for different sizes
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string
  } = {}
): string {
  if (!isCloudinaryConfigured) {
    return publicId // Return original URL if not configured
  }

  const { width, height, crop = 'fill', quality = 'auto' } = options

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop, quality },
      { fetch_format: 'auto' },
    ],
    secure: true,
  })
}

// Get thumbnail URL
export function getThumbnailUrl(publicId: string, size: number = 300): string {
  return getOptimizedUrl(publicId, { width: size, height: size, crop: 'fill' })
}

// Generate signed upload URL for direct client uploads
export function getSignedUploadParams(
  folder: string = 'propestate'
): {
  timestamp: number
  signature: string
  cloudName: string
  apiKey: string
  folder: string
} | null {
  if (!isCloudinaryConfigured) {
    return null
  }

  const timestamp = Math.round(Date.now() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
  }
}

export default cloudinary
