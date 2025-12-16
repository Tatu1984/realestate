import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadImage, uploadDocument, uploadMultipleImages } from '@/lib/upload'
import {
  isCloudinaryConfigured,
  uploadPropertyImage,
  uploadAvatar,
  uploadDocument as uploadCloudinaryDocument,
  uploadMultipleToCloudinary,
} from '@/lib/cloudinary'
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(request, 'api')
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Require authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const uploadType = formData.get('type') as string || 'image'
    const category = formData.get('category') as 'images' | 'avatars' | 'properties' || 'images'
    const useCloud = formData.get('cloud') === 'true' || isCloudinaryConfigured

    // Handle single file upload
    const file = formData.get('file') as File | null
    const files = formData.getAll('files') as File[]

    if (!file && files.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Single file upload
    if (file) {
      let result

      // Use Cloudinary if configured, otherwise fall back to local storage
      if (useCloud && isCloudinaryConfigured) {
        if (uploadType === 'document') {
          result = await uploadCloudinaryDocument(file)
        } else if (category === 'avatars') {
          result = await uploadAvatar(file)
        } else {
          result = await uploadPropertyImage(file)
        }
      } else {
        // Local storage fallback
        if (uploadType === 'document') {
          result = await uploadDocument(file)
        } else {
          result = await uploadImage(file, category)
        }
      }

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      logger.info('File uploaded', {
        url: result.url,
        userId: session.user.id,
        type: uploadType,
        storage: useCloud && isCloudinaryConfigured ? 'cloudinary' : 'local',
      })

      return NextResponse.json({
        url: result.url,
        publicId: 'publicId' in result ? result.publicId : undefined,
      })
    }

    // Multiple files upload
    if (files.length > 0) {
      // Limit to 10 files at a time
      if (files.length > 10) {
        return NextResponse.json(
          { error: 'Maximum 10 files allowed per upload' },
          { status: 400 }
        )
      }

      let result

      if (useCloud && isCloudinaryConfigured) {
        result = await uploadMultipleToCloudinary(files, {
          folder: `propestate/${category}`,
        })
      } else {
        result = await uploadMultipleImages(files, category)
      }

      logger.info('Multiple files uploaded', {
        count: result.urls.length,
        errors: result.errors.length,
        userId: session.user.id,
        storage: useCloud && isCloudinaryConfigured ? 'cloudinary' : 'local',
      })

      return NextResponse.json({
        urls: result.urls,
        errors: result.errors.length > 0 ? result.errors : undefined,
      })
    }

    return NextResponse.json({ error: 'No files to process' }, { status: 400 })
  } catch (error) {
    logger.error('Upload error', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
