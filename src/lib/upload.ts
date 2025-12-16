import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { logger } from './logger'

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

// Max file sizes (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10MB

// Upload directories
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const IMAGE_DIR = path.join(UPLOAD_DIR, 'images')
const DOCUMENT_DIR = path.join(UPLOAD_DIR, 'documents')
const AVATAR_DIR = path.join(UPLOAD_DIR, 'avatars')
const PROPERTY_DIR = path.join(UPLOAD_DIR, 'properties')

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

interface FileValidation {
  valid: boolean
  error?: string
}

// Ensure upload directories exist
async function ensureDirectories(): Promise<void> {
  const dirs = [UPLOAD_DIR, IMAGE_DIR, DOCUMENT_DIR, AVATAR_DIR, PROPERTY_DIR]
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
  }
}

// Validate file
function validateFile(
  file: File,
  allowedTypes: string[],
  maxSize: number
): FileValidation {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` }
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB` }
  }

  return { valid: true }
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase()
  const uuid = uuidv4()
  return `${uuid}${ext}`
}

// Upload image
export async function uploadImage(
  file: File,
  subdir: 'images' | 'avatars' | 'properties' = 'images'
): Promise<UploadResult> {
  const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  try {
    await ensureDirectories()

    const filename = generateFilename(file.name)
    const dirMap = {
      images: IMAGE_DIR,
      avatars: AVATAR_DIR,
      properties: PROPERTY_DIR,
    }
    const targetDir = dirMap[subdir]
    const filePath = path.join(targetDir, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const url = `/uploads/${subdir}/${filename}`
    logger.info('Image uploaded successfully', { filename, size: file.size, url })

    return { success: true, url }
  } catch (error) {
    logger.error('Failed to upload image', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

// Upload document
export async function uploadDocument(file: File): Promise<UploadResult> {
  const validation = validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  try {
    await ensureDirectories()

    const filename = generateFilename(file.name)
    const filePath = path.join(DOCUMENT_DIR, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const url = `/uploads/documents/${filename}`
    logger.info('Document uploaded successfully', { filename, size: file.size, url })

    return { success: true, url }
  } catch (error) {
    logger.error('Failed to upload document', error)
    return { success: false, error: 'Failed to upload document' }
  }
}

// Upload multiple images
export async function uploadMultipleImages(
  files: File[],
  subdir: 'images' | 'avatars' | 'properties' = 'properties'
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = []
  const errors: string[] = []

  for (const file of files) {
    const result = await uploadImage(file, subdir)
    if (result.success && result.url) {
      urls.push(result.url)
    } else {
      errors.push(result.error || 'Unknown error')
    }
  }

  return { urls, errors }
}

// Delete file
export async function deleteFile(url: string): Promise<boolean> {
  try {
    // Extract path from URL
    const relativePath = url.replace(/^\//, '')
    const filePath = path.join(process.cwd(), 'public', relativePath)

    if (existsSync(filePath)) {
      await unlink(filePath)
      logger.info('File deleted successfully', { url })
      return true
    }

    logger.warn('File not found for deletion', { url })
    return false
  } catch (error) {
    logger.error('Failed to delete file', error, { url })
    return false
  }
}

// Parse form data and extract files
export async function parseFormDataWithFiles(
  request: Request
): Promise<{
  fields: Record<string, string>
  files: Record<string, File | File[]>
}> {
  const formData = await request.formData()
  const fields: Record<string, string> = {}
  const files: Record<string, File | File[]> = {}

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (files[key]) {
        // Multiple files with same key
        if (Array.isArray(files[key])) {
          (files[key] as File[]).push(value)
        } else {
          files[key] = [files[key] as File, value]
        }
      } else {
        files[key] = value
      }
    } else {
      fields[key] = value.toString()
    }
  }

  return { fields, files }
}

// Get file info
export function getFileInfo(url: string): { exists: boolean; type: string; size?: number } {
  try {
    const relativePath = url.replace(/^\//, '')
    const filePath = path.join(process.cwd(), 'public', relativePath)

    if (!existsSync(filePath)) {
      return { exists: false, type: 'unknown' }
    }

    const ext = path.extname(filePath).toLowerCase()
    const typeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }

    return {
      exists: true,
      type: typeMap[ext] || 'application/octet-stream',
    }
  } catch {
    return { exists: false, type: 'unknown' }
  }
}
